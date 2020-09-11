const readdirp = require(`readdirp`);

const run = async (time = false) => {
  if (time) console.time(`readDir`);
  const entries = new Set();
  await new Promise((resolve) => {
    readdirp("public/page-data", { fileFilter: "page-data.json" })
      .on(`data`, (entry) => {
        entries.add("public/page-data/" + entry.path);
      })
      .on(`end`, resolve);
  });
  if (time) console.timeEnd(`readDir`);
  return entries;
};

// run();
exports.run = run;
