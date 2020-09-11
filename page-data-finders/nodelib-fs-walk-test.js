const fsWalk = require(`@nodelib/fs.walk`);

const run = async (time = false) => {
  const t = new Set();
  // const all = new Set()
  if (time) console.time(`@nodelib/fs.walk`);
  // fsWalk.walk(`public/page-data`, (error, entries) => {
  //   t.add(entries)
  //   console.timeEnd(`@nodelib/fs.walk`)
  //   debugger
  // })
  await new Promise((resolve) => {
    const stream = fsWalk.walkStream(`public/page-data`, {
      deepFilter: (entry) => {
        const isNotStaticQueries = entry.path !== `public/page-data/sq/d`;
        return isNotStaticQueries;
      },
    });

    stream.on("data", (data) => {
      if (data.name === `page-data.json`) {
        t.add(data.path);
      }
      // all.add(data)
      // debugger
    });

    stream.on("end", () => {
      if (time) console.timeEnd(`@nodelib/fs.walk`);
      // debugger
      resolve();
    });
  });

  return t;
  // debugger
  // console.log(oldPageDataFiles)
};

// run();
exports.run = run;
