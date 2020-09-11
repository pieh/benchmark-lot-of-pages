const { readdir } = require(`fs-extra`);

const run = async (time = false) => {
  if (time) console.time(`readDir`);
  // console.log(`start`);
  const entries = new Set();

  async function walk(prefix, fileOrDirName) {
    const newPrefix = `${prefix}/${fileOrDirName}`;
    if (fileOrDirName === `page-data.json`) {
      entries.add(newPrefix);
    } else {
      const files = await readdir(newPrefix);
      await Promise.all(files.map((f) => walk(newPrefix, f)));
    }
  }

  const oldPageDataFiles = await readdir(`public/page-data`);

  await Promise.all(
    oldPageDataFiles.map(async (f) => {
      if (f === `sq` || f == `app-data.json`) {
        return;
      }

      await walk(`public/page-data`, f);
    })
  );

  // await new Promise(resolve => {
  //   readdirp("public/page-data", { fileFilter: "page-data.json" })
  //     .on(`data`, entry => {
  //       entries.add(entry)
  //     })
  //     .on(`end`, resolve)
  // })
  if (time) console.timeEnd(`readDir`);
  // debugger;
  // console.log(`end`);
  return entries;
  // console.log(oldPageDataFiles)
};

// run();
exports.run = run;
