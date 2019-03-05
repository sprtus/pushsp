const chalk = require('chalk');
const rimraf = require('rimraf');
const utility = require('./utility');

// Pull latest from git repository
module.exports = async function(config) {
  // Begin
  console.log(`\nPulling latest: ${chalk.white.bold(config.repo)}`);

  // Clean destination folder
  console.log(chalk.gray('  Cleaning dist folder...'));
  rimraf.sync(utility.path(config.pullFolder));

  // Pull repository
  console.log(chalk.gray('  Cloning repository...\n'));
  await utility.shell(`git clone ${config.repo} "${utility.path(config.pullFolder)}"`);

  // Run build scripts
  for (let i = 0; i < config.buildScripts.length; i++) {
    console.log(`\nRunning build script: ${chalk.cyan(config.buildScripts[i])} ${chalk.gray(`[${i + 1}/${config.buildScripts.length}]`)}\n`);
    await utility.shell(config.buildScripts[i], utility.path(config.pullFolder));
  }

  // Done
  console.log(`\n${chalk.green.bold('Done!')} Use ${chalk.white.bold('pushsp push')} to deploy files.\n`);
};
