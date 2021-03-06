const fs = require("fs");
const path = require("path");
const faker = require(`faker`);

// const N = parseInt(process.env.N, 10) || 100;
// let's create single node and copy page data around - there is no point
// in sourcing all of this, running queries and building html files
const N = 1;

let n = 0;

function createArticle(n, sentence, slug) {
  const desc = faker.lorem.sentence();

  return `---
articleNumber: ${n}
title: "${sentence.replace(/"/g, '\\"')}"
description: "${desc.replace(/"/g, '\\"')}"
path: '${slug}'
date: ${faker.date.recent(1000).toISOString().slice(0, 10)}
tags: [${faker.random
    .words(3)
    .split(` `)
    .map((w) => `"${w}"`)
    .join(`, `)}]
---

# ${sentence}

> ${desc}

${faker.lorem.paragraphs(2)}
`;
}

exports.generate = () => {
  console.log("Start of gen");

  if (fs.existsSync("./generated_articles")) {
    fs.rmdirSync(`./generated_articles`, { recursive: true });
    // TODO; // count existing folders. If they are less than given number, just amend to them. Otherwise abort and require a rimraf
  }

  fs.mkdirSync("./generated_articles", { recursive: true });

  console.log("Now generating " + N + " articles");
  for (let i = 0; i < N; ++i) {
    const sentence = faker.lorem.sentence();
    // const slug = faker.helpers.slugify(sentence).toLowerCase();
    const slug = `lorem`;
    fs.writeFileSync(
      path.join("./generated_articles", slug + ".md"),
      createArticle(i, sentence, slug)
    );
  }
  console.log("Finished generating " + N + " articles");
  console.log("End of gen");
};
