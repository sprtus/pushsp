const path = require('path');
const rimraf = require('rimraf');
const utility = require('./utility');

// Pull latest from git repository
module.exports = async function(config) {
  // Begin
  console.log(`Pulling latest from ${config.repo}...`);

  // Clean destination folder
  console.log('Cleaning dist folder...');
  rimraf.sync(utility.path(config.pullFolder));

  // Pull repository
  console.log('Cloning repository...');
  await utility.shell(`git clone ${config.repo} ${utility.path(config.pullFolder)}`);

  // Run build scripts
  for (const buildScript of config.buildScripts) {
    console.log(`Running build script: ${buildScript}`);
    await utility.shell(buildScript, utility.path(config.pullFolder));
  }

  // Done
  console.log('Done!');
};
