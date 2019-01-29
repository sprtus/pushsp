const spsave = require('spsave').spsave;

module.exports = async function(config) {
  // Begin
  console.log('Pushing latest to all sites...');

  // Push to each site
  for (const site of config.sites) {
    console.log(`Pushing to ${site}...`);
    await spsave({
      siteUrl: site,
      notification: true,
      checkin: true,
      checkinType: 1,
    }, config.auth, {
      glob: config.pushFiles,
      base: config.pushFilesBase,
      folder: config.targetPath,
    }).catch(e => console.error(e));
  }
};
