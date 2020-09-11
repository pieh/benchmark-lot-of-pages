const globby = require(`globby`);

const run = async (time = false) => {
  if (time) console.time(`globby`);
  const oldPageDataFiles = await globby(`public/page-data/**/page-data.json`);
  if (time) console.timeEnd(`globby`);
  return new Set(oldPageDataFiles);
  // console.log(oldPageDataFiles)
};

// run();
exports.run = run;
