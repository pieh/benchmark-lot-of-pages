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
  const progress = reporter.createProgress(`cloning page-data`, N);
  progress.start();

  for (let i = 1; i < N; i++) {
    fs.copySync(
      path.join(process.cwd(), `public/page-data/lorem/page-data.json`),
      path.join(
        process.cwd(),
        `public/page-data/${faker.helpers
          .slugify(faker.lorem.sentence())
          .toLowerCase()}/page-data.json`
      )
    );
    progress.tick();
  }

  progress.end();
  await runCompare();
};
