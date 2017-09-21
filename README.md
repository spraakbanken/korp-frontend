This repo contains the frontend for [Korp](https://spraakbanken.gu.se/korp), a frontend for the IMS Open Corpus Workbench (CWB). The korp frontend is a great tool for searching and
and visualising natural language corpus data. 

Korp is developed by [Språkbanken](https://spraakbanken.gu.se) at the University of Gothenburg, Sweden. 

Documentation:
- [Frontend documentation](https://spraakbanken.gu.se/eng/research/infrastructure/korp/distribution/frontend)
- [Backend documentation](https://spraakbanken.gu.se/eng/research/infrastructure/korp/distribution/backend)
- Sparv - The pipeline used to tag and otherwise process raw Swedish-language corpus data is documented [here](https://spraakbanken.gu.se/eng/research/infrastructure/korp/distribution/corpuspipeline)

## sass

To compile the sass-stylesheets, Ruby and sass is required. Install Ruby and then `gem install sass`

## npm

To install all Grunt-dependencies needed run `npm install`

## bower

All dependencies that are needed are under version control (`app/components`). To add a new dependency run:
`bower install --save-dev <package_name>`

## grunt

Available target in grunt are:

- clean - Remove all built files
- test - Run tests. The graphical user tests are dependent on SUC 2.0, SUC 3.0 and a parallel mode with some corpora available in the tested instance. Run `node_modules/protractor/bin/webdriver-manager update` to install drivers.
- build - Same as running only `grunt`. Creates a dist-folder with only built files, css and js are concatenated and minfied. html are also minified.
- serve - Start a local instance of Korp. Also builds any necessary files.
- release - Same as build, but updates a file with SVN revision

## Local setup for Ubuntu

- `sudo apt install npm`
- `sudo npm install -g grunt-cli`
- `sudo apt install nodejs`
- `npm install`
- `sudo ln -s /usr/bin/nodejs /usr/bin/node` or `sudo apt install nodejs-legacy`
- `sudo apt install ruby-dev`
- `sudo gem install sass`
- `grunt serve`

## run_config.json

To use your own versions of the configuration-files without creating them in this project, 
use a `run_config.json` file in the root of the project with the following content:

```
{
    "configDir": "../path/to/my/configuration/folder"
}
```

In this folder, use the same layout as in Korp and add the following files:

- `app/config.js`
- `app/modes/*mode.js`
- `app/modes/common.js`
- `app/translations/*.json`

## Known bugs

Korp has a number of known bugs. Most are GUI bugs, but some are more serious. They will be fixed!

- Issues with linking to Korp and internal links. Opening a link to Korp in a tab where Korp is already open often leads to errors. For example selected corpora will not change.
- A bug in CWB that makes CQP-expressions searching for first a token ending with " and then another token fail. Example: [word = "\""] [word = "och"].
