const _ = require('lodash');
const { PnpNode } = require('sp-pnp-node');
const { Web } = require('@pnp/sp');
const chalk = require('chalk');
const fs = require('fs');
const globby = require('globby');
const path = require('path');

// Known folders that don't need to be created on deployment
const knownFolders = [
  '_catalogs',
  '_catalogs/masterpage',
  '_catalogs/wp',
];

module.exports = async function(config) {
  // Begin
  console.log(chalk.white.bold('\nPushing latest to all sites...'));

  // Add folders
  const folders = [];
  function addFolders(dir) {
    let folderSegments = dir.split('/');
    while (folderSegments.length) {
      const newFolder = folderSegments.join('/');
      if (folders.indexOf(newFolder) === -1 && knownFolders.indexOf(newFolder) === -1) folders.push(newFolder);
      folderSegments.pop();
    }
  }

  // Get files and folders
  const cwd = process.cwd();
  const files = globby.sync(config.pushFiles, { cwd }).map(filePath => {
    // Get file stats
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) return undefined;

    // Get relative directory
    const dir = path.dirname(filePath).replace(config.pushFilesBase, '').replace(/^\//g, '');
    addFolders(dir);

    // Process file
    return {
      cwd,
      path: path.resolve(filePath),
      name: path.basename(filePath),
      dir,
      stat,
      content: fs.readFileSync(filePath),
    };
  }).filter(filePath => filePath !== undefined);

  // Sort folders by length
  folders.sort((a, b) => {
    if (a.length < b.length) return -1;
    else if (a.length > b.length) return 1;
    else return 0;
  });

  // Push to each site
  for (const site of config.sites) {
    console.log(`\nPushing files to: ${chalk.cyan.underline(site)}`);

    // Connect
    await new PnpNode({
      siteUrl: site,
      authOptions: config.auth ? config.auth : undefined,
      config: {
        configPath: path.resolve(`./_auth/${_.snakeCase(site).replace(/^https?_/gi, '')}.json`),
        encryptPassword: true,
        saveConfigOnDisk: true,
      },
    }).init().then(async function (pnpNode) {
      console.log(`  Connected to ${chalk.green(pnpNode.siteUrl)}\n`);

      // Get web
      const web = new Web(pnpNode.siteUrl);

      // Get web relative URL
      const webProps = await web.get().catch(e => console.error);
      const webRelativeUrl = webProps.ServerRelativeUrl;

      // Create folders
      console.log('Verifying target folders');
      for (const folder of folders) {
        console.log(chalk.gray(`  ${folder}`));
        const rFolder = `${webRelativeUrl}/${config.targetPath}/${folder}`.replace(/\/+/g, '/');
        await web.folders.add(rFolder).catch(e => {});
      }

      // Create files
      for (const file of files) {
        // Get relative paths
        const rFolder = `${webRelativeUrl}/${config.targetPath}/${file.dir}`.replace(/\/+/g, '/');
        let rFile = `${rFolder}/${file.name}`.replace(/\/+/g, '/');

        // Get URL
        const url = `${site}/${rFile}`.replace(/\/+/g, '/');
        console.log(url);

        // Check out, upload, check in, approve
        const fileCheckedOut = await web.getFileByServerRelativeUrl(rFile).checkout().catch(e => {});
        console.log(`  ${chalk.cyan('✓')} ${chalk.gray('Checked out')}`);
        const fileAdded = await web.getFolderByServerRelativeUrl(rFolder).files.add(file.name, file.content, true).catch(e => console.error);
        console.log(`  ${chalk.cyan('✓')} ${chalk.gray('Uploaded')}`);
        const fileCheckedIn = await web.getFileByServerRelativeUrl(rFile).checkin('Checked in via pushsp', 1).catch(e => {});
        console.log(`  ${chalk.cyan('✓')} ${chalk.gray('Checked in')}`);
        const fileApproved = await web.getFileByServerRelativeUrl(rFile).approve('Approved via pushsp', 1).catch(e => {});
        console.log(`  ${chalk.cyan('✓')} ${chalk.gray('Approved')}`);
      }
    });

    console.log(`\nSite updated: ${chalk.cyan.underline(site)}\n`);
  }

  console.log(chalk.green.bold('All sites updated.\n'));
};
