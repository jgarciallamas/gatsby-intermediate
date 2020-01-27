// const withDefaults = require('./utils/default-options');
// const path = require('path');
// const fs = require('fs');
// const mkdirp = require('mkdirp');

// exports.onPreBootstrap = ({ store }, options) => {
//   const { program } = store.getState();
//   console.log('program', program)

//   //TODO get options with defaults
//   const { contentPath } = withDefaults(options);
//   console.log('contentPath', contentPath)

//   //TODO figure out the content path
//   const dir = path.join(program.directory, contentPath);
//   //TODO if directory doesn't exist, create it
//   console.log('dir', dir)

//   if( !fs.existsSync(dir) ) {
//     //TODO create the dir
//     mkdirp.sync(dir);
//   }
// };
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const withDefaults = require('./utils/default-options');

exports.onPreBootstrap = ({ store }, options) => {
  console.log('JOSE--> onPreBootstrap hook');
  const { program } = store.getState();
  const { contentPath } = withDefaults(options);
  const dir = path.join(program.directory, contentPath);

  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir);
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  console.log('JOSE--> createSchemaCustomization hook');
  actions.createTypes(`
    type DocsPage implements Node @dontInfer {
      id: ID!,
      title: String!,
      path: String!,
      updated: Date! @dateformat,
      body: String!
    }
  `);
};

exports.onCreateNode = ({ node, actions, getNode, createNodeId }, options) => {
  console.log('JOSE--> onCreateNode hook');
  const { basePath } = withDefaults(options);
  const parent = getNode(node.parent);

  //Only work on MDX files that were loaded by this theme(gatsby-theme-docs)

  if (
    node.internal.type !== 'Mdx' ||
    parent.sourceInstanceName !== 'gatsby-theme-docs'
  ) {
    return;
  }

  //Treat 'index.mdx' link 'index.html' (i.e. '/docs' vs '/docs/index/')

  const pageName = parent.name !== 'index' ? parent.name : '';

  actions.createNode({
    id: createNodeId(`DocsPage-${node.id}`),
    title: node.frontmatter.title || parent.name,
    updated: parent.modifiedTime,
    path: path.join('/', basePath, parent.relativeDirectory, pageName),
    // path: path.join('/', basePath, parent.relativeDirectory, pageName),
    parent: node.id,
    internal: {
      type: 'DocsPage',
      contentDigest: node.internal.contentDigest,
    },
  });
};

exports.createResolvers = ({ createResolvers }) => {
  console.log('JOSE--> onCreateResolvers hook');
  createResolvers({
    DocsPage: {
      body: {
        type: 'String!',
        resolve: (source, args, context, info) => {
          // Load the resolver for the `Mdx`type `body` field.
          const type = info.schema.getType('Mdx');
          const mdxFields = type.getFields();
          const resolver = mdxFields.body.resolve;

          const mdxNode = context.nodeModel.getNodeById({ id: source.parent });

          return resolver(mdxNode, args, context, {
            fieldName: 'body',
          });
        },
      },
    },
  });
};
