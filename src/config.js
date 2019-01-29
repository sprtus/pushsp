const fs = require('fs');
const utility = require('./utility');

module.exports = function() {
  // Get config file path
  const configFilePath = utility.path('pushsp.json');

  // No config file
  if (!fs.existsSync(configFilePath)) {
    return console.error('Configuration file not found. Use "pushsp init" to create one.');
  }

  // Get config JSON
  let config = {};
  const fileContents = fs.readFileSync(configFilePath);
  try {
    config = JSON.parse(fileContents);
  } catch (e) {
    console.error('Error parsing config file: ', e);
  }

  return config;
};
