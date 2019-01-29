# PushSP

Push files from a Git repository direclty to one or more SharePoint environments.

## Getting Started

Install the *pushsp* command globally to your machine using NPM:

```sh
npm install pushsp -g
```

Once installed, you can use the `pushsp` command from any terminal window.

## Commands

### `init`

```sh
pushsp init
```

Initializes the current directory as a PushSP directory. This command will create a new configuration file called `pushsp.json` if it doesn’t already exist. This JSON file contains several configuration options:

1. `repo` – the Git repository from which to pull the solution
    * Works with both SSH and HTTPS
    * For private repositories, be sure to [configure a SSH key](https://help.github.com/articles/connecting-to-github-with-ssh/) so that the `git clone` command will work properly
2. `pullFolder` – the cloned Git solution will be placed into this local directory
3. `buildScripts` – an optional array of terminal commands that will be executed immediately after each `git clone`
    * This can be useful if your solution requires some sort of build process (Webpack, TypeScript, etc.)
    * If you don’t need any build script, just set this to an empty array
4. `pushFiles` – defines which files will be deployed to target SharePoint environments
    * See [spsave documentation](https://github.com/s-KaiNet/spsave#glob-options-you-can-provide-a-mask-to-read-all-or-certain-files-from-the-file-system) for more information
5. `pushFilesBase` – base for all file deployments, for determining target SharePoint environment paths
    * See [spsave documentation](https://github.com/s-KaiNet/spsave#glob-options-you-can-provide-a-mask-to-read-all-or-certain-files-from-the-file-system) for more information
6. `targetPath` – site-relative folder to which all files will be deployed within each SharePoint site
7. `sites` – an array of site URLs to which all files will be deployed
    * You can deploy files to any number of SharePoint sites
    * Note that if you are deploying to many different sites, you may want to provide `auth` configuration (below), to avoid repeated authentication prompts
8. `auth` – SharePoint authentication configuration
    * The default value is `null`, and by default you’ll be automatically prompted for authentication, and auth configuration for each site will be saved to an encrypted local file
    * You may also choose to manually specify authentication configuration
    * See [node-sp-auth documentation](https://github.com/s-KaiNet/node-sp-auth/blob/master/package.json) for more information on all available configuration options

### `pull`

```sh
pushsp pull
```

Pulls the latest solution from the configured Git repository and subsequently runs any specified build scripts.

### `push`

```sh
pushsp push
```

Deploys pulled files to all target SharePoint sites.
