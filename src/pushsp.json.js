module.exports = `{
  "repo": "git@github.com:organization/repository.git",
  "pullFolder": "dist",
  "buildScripts": [
    "npm install"
  ],
  "pushFiles": "dist/**/*.*",
  "pushFilesBase": "dist",
  "targetPath": "/",
  "sites": [
    "https://yoursite.sharepoint.com/"
  ],
  "auth": null
}
`;
