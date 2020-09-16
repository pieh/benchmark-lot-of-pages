const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);
const { generate } = require(`./gen-md`);
const { runCompare } = require(`./compare`);
const faker = require(`faker`);
const fs = require("fs-extra");

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const blogPost = path.resolve(`./src/templates/blog-post.js`);
  const result = await graphql(
    `
      {
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
          edges {
            node {
              id
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        id: post.node.id,
        previous,
        next,
      },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};

exports.onPreBootstrap = () => {
  generate();
};

exports.onPostBuild = async ({ reporter }) => {
  const N = parseInt(process.env.N, 10) || 100;
  const MAX_DEPTH = parseInt(process.env.MAX_DEPTH, 10) || 4;
  const MAX_SIBLINGS = Math.sqrt(N);

  const progress = reporter.createProgress(`cloning page-data`, N - 1);
  progress.start();

  let previousPath,
    currentDepth = 0,
    currentMaxDepth,
    currentSibling = 0,
    currentMaxSibling = 0;

  for (let i = 1; i < N; i++) {
    let outputPath;
    let currentSlug = faker.helpers
      .slugify(faker.lorem.sentence())
      .toLowerCase();
    if (currentDepth === 0) {
      outputPath = `public/page-data/${currentSlug}`;
      currentMaxDepth = Math.floor(Math.random() * MAX_DEPTH);
    } else {
      outputPath = `${previousPath}/${currentSlug}`;
      if (currentSibling === 0) {
        currentMaxSibling = Math.floor(Math.random() * MAX_SIBLINGS);
      }
    }

    // const

    fs.copySync(
      path.join(process.cwd(), `public/page-data/lorem/page-data.json`),
      path.join(process.cwd(), outputPath, `page-data.json`)
    );

    if (currentSibling < currentMaxSibling) {
      currentSibling++;
    } else {
      previousPath = outputPath;
      currentSibling = 0;

      if (currentDepth < currentMaxDepth) {
        currentDepth++;
      } else {
        currentDepth = 0;
      }
    }
    progress.tick();
  }

  progress.end();

  const interval = setInterval(() => {
    reporter.verbose(`heartbeat`);
  }, 3 * 60 * 1000);
  await runCompare();
  clearInterval(interval);
};
