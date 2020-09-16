const { run: fsRun } = require(`./page-data-finders/fs-test`);
const { run: globRun } = require(`./page-data-finders/glob-test`);
const {
  run: nodelibFsWalkRun,
} = require(`./page-data-finders/nodelib-fs-walk-test`);
const { run: readdirpRun } = require(`./page-data-finders/readdirp-test`);
const Benchmark = require("benchmark");

const finders = {
  "fs-extra": fsRun,
  globby: globRun,
  "@nodelib/fs-walk": nodelibFsWalkRun,
  readdirp: readdirpRun,
};

function compareResults(r1, r2) {
  if (r1.size !== r2.size) {
    return false;
  }

  r1.forEach((t) => {
    if (!r2.has(t)) {
      return false;
    }
  });

  return true;
}

async function runCompare() {
  console.log(
    `Checking correctness and printing timing info for single runs (proper benchmarks might time out here :S)`
  );

  const results = {};

  for (const [type, fn] of Object.entries(finders)) {
    console.time(type);
    const result = await fn();
    console.timeEnd(type);
    if (Array.isArray(result)) {
      results[type] = new Set(result);
    } else {
      results[type] = result;
    }
  }

  let areAllTheSameResults = true;
  let first = undefined;
  for (const [type, fn] of Object.entries(finders)) {
    if (!first) {
      first = { type, fn };
    } else {
      const cmp = compareResults(results[first.type], results[type]);
      if (!cmp) {
        areAllTheSameResults = false;
        console.log(`Results of "${first.type}" and "${type}" are different`);
      }
    }
    results[type] = await fn();
  }

  // const c1 = compareResults(results["fs-extra"], results["globby"]);
  // const c2 = compareResults(results["fs-extra"], results["@nodelib/fs-walk"]);
  // const c3 = compareResults(results["fs-extra"], results["readdirp"]);

  // let areAllTheSameResults = c1 && c2 && c3;
  console.log({ areAllTheSameResults });

  console.log("Running benchmark");

  const suite = new Benchmark.Suite({
    minSamples: 150,
  });

  for (const [type, fn] of Object.entries(finders)) {
    suite.add(type, {
      minSamples: 50,
      defer: true,
      fn: async (deferred) => {
        await fn();
        deferred.resolve();
      },
    });
  }

  await new Promise((resolve) => {
    suite
      .on("cycle", function (event) {
        console.log(String(event.target));
      })
      .on("complete", function () {
        console.log("Fastest is " + this.filter("fastest").map("name"));
        resolve();
      })
      .run({
        defer: true,
      });
  });
}

exports.runCompare = runCompare;
