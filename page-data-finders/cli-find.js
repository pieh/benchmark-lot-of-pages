const childProcess = require(`child_process`);

const run = async (time = false) => {
  if (time) console.time(`cli find`);

  let results;
  await new Promise((resolve) => {
    // this is linux only, it doesn't actually work on mac
    childProcess.exec(
      `find -type f  -name "page-data.json"`,
      {
        cwd: `${process.cwd()}/public/page-data`,
      },
      (error, stdout, stderr) => {
        // console.log({ stdout });
        results = stdout.split(`\n`).filter(Boolean);
        resolve();
      }
    );
  });
  // const oldPageDataFiles = await globby(`public/page-data/**/page-data.json`);
  if (time) console.timeEnd(`cli find`);
  return results;
  // console.log(oldPageDataFiles)
};

// run();
exports.run = run;
