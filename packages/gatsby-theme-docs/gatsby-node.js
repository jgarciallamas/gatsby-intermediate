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
  // console.log('hiiiii');
  const { program } = store.getState();
  const { contentPath } = withDefaults(options);
  const dir = path.join(program.directory, contentPath);

  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir);
  }
};
