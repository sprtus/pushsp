const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

module.exports = {
  // Build path
  path: function(filePath, cwd = true) {
    return path.normalize(`${cwd ? process.cwd() : __dirname}/${filePath}`);
  },

  // Execute shell command
  shell: async function(command, cwd) {
    const { stdout, stderr } = await exec(command, { cwd: cwd ? cwd : null });
    if (stderr) console.error(stderr);
    console.log(stdout);
  },
};
