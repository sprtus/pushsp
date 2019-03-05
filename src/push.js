const { PnpNode } = require('sp-pnp-node');
const { Web } = require('@pnp/pnpjs');
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
    console.log(`\nPushing files to: ${chalk.cyan.underline(site)}\n`);

    // Connect
    await new PnpNode().init({
      siteUrl: site,
      authOptions: config.auth,
    }).then(async function (pnpNode) {
      // Get web
      const web = new Web(site);

      // Get web relative URL
      let webRelativeUrl;
      await web.select('ServerRelativeUrl').get().then(response => {
        webRelativeUrl = response.ServerRelativeUrl;
      }).catch(e => console.error);

      // Create folders
      console.log('  Verifying target folders');
      for (const folder of folders) {
        console.log(chalk.gray(`    ${folder}`));
        await web.folders.add(folder).catch(e => {});
      }

      // Create files
      for (const file of files) {
        // Get relative paths
        const rFolder = `/${webRelativeUrl}/${config.targetPath}/${file.dir}`.replace(/\/+/g, '/');
        const rFile = `${rFolder}/${file.name}`.replace(/\/+/g, '/');

        // Get URL
        const url = `${site}/${rFolder}/${chalk.bold(file.name)}`.replace(/\/+/g, '/');
        console.log(`  ${url}`);

        // Check out, upload, check in, approve
        await web.getFileByServerRelativeUrl(rFile).checkout().catch(e => {});
        console.log(`    ${chalk.cyan('✓')} ${chalk.gray('Checked out')}`);
        await web.getFolderByServerRelativePath(rFolder).files.add(file.name, file.content, true).catch(e => {});
        console.log(`    ${chalk.cyan('✓')} ${chalk.gray('Uploaded')}`);
        await web.getFileByServerRelativeUrl(rFile).checkin('Updated via pushsp', 1).catch(e => {});
        console.log(`    ${chalk.cyan('✓')} ${chalk.gray('Checked in')}`);
        await web.getFileByServerRelativeUrl(rFile).approve('Approved via pushsp').catch(e => {});
        console.log(`    ${chalk.cyan('✓')} ${chalk.gray('Approved')}`);
      }
    });

    console.log(`\nSite updated: ${chalk.cyan.underline(site)}\n`);
  }

  console.log(chalk.green.bold('All sites updated.\n'));
};
