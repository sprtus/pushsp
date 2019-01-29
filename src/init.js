const fs = require('fs');
const utility = require('./utility');

const configTemplate = require('./pushsp.json');

module.exports = function() {
  // Begin
  console.log('Initializing...');

  // Get config file path
  const configFilePath = utility.path('pushsp.json');

  // Already exists
  if (fs.existsSync(configFilePath)) {
    return console.warn('pushsp.json already exists.');
  }

  // Create file
  console.log('Creating config file...');
  fs.writeFileSync(configFilePath, configTemplate, { flag: 'wx+' });

  // Done
  console.log(`Config file created: ${configFilePath}`);
};
