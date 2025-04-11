This repo contains the frontend for [Korp](https://spraakbanken.gu.se/korp), Språkbanken's word research platform using the IMS Open Corpus Workbench (CWB).
Korp is a great tool for searching and visualising natural language corpus data.

Korp is mainly developed by [Språkbanken](https://spraakbanken.gu.se) at the 
University of Gothenburg, Sweden. Contributions are also made from other
organizations that use the software.

Documentation:
- [Frontend documentation](../master/doc/frontend_devel.md)
- [Backend documentation](https://github.com/spraakbanken/korp-backend/)
- Sparv - The pipeline used to tag and otherwise process raw Swedish-language corpus data is documented [here](https://spraakbanken.gu.se/sparv)
- [Språkbanken's Korp configuration directory](https://github.com/spraakbanken/korp-frontend-sb/) (supplement to documentation)

# Getting started

Install `yarn`: `https://yarnpkg.com`

## Using `yarn`

- install all dependencies: `yarn`
- run development server: `yarn start`
- build a dist-version: `yarn build`

Declare dependencies using `yarn add pkg`or `yarn add --dev pkg` for dev dependencies.

`npm` has not worked previously, but the status is unknown right now.

# webpack

We use *webpack* to build Korp and *webpack-dev-server* to run a local server. To include new code or resources, require
or use import them where needed:

```
import { aFunction } from 'new-dependency'
```

or

```
nd = require("new-dependency")
nd.aFunction()
```

or

```
imgPath = require("img/image.png")
myTemplate = `<img src='${imgPath}'>`
```

Some dependencies are only specified in `app/index.ts`.

About the current loaders in `webpack.config.js`:
- `pug` and `html` files: all `src`-attributes in `<img>` tags and all `href`s in `<link>` tags will be
  loaded by webpack and replaced in the markup. Uses file loader so that requiring a `pug`
  or `html` file will give the path to the file back.
- `js` files are added to the bundle
- all images and fonts are added to the bundle using file loader and gives back a file path.
- `css` and `scss` are added to the bundle. `url`s will be loaded and replaced by webpack.

In addition to this, some specific files will simply be copied as is, for example Korp mode-files.

## Configuration

Use `config.yml` for settings needed in the frontend. In some cases, mode-files can be used. For example 
it is possible to have different backends for modes.

# Other instances

There are several instances of Korp, here are a list of some:

- [Språkbanken Text](https://spraakbanken.gu.se/korp/)
- [The Language Bank of Finland (Kielipankki)](https://korp.csc.fi)
- [Iceland / Stofnun Árna Magnússonar í íslenskum fræðum](https://malheildir.arnastofnun.is/)
- [Tromsø / Giellatekno](https://gtweb.uit.no/korp/)
- [Copenhagen / Institut for Nordiske Studier og Sprogvidenskab](https://alf.hum.ku.dk/korp/)

# The development server

When developing, the frontend is served at http://localhost:9111 by default.

Host and port can be changed by the environment variables:
- `KORP_HOST=<host>`
- `KORP_PORT=<port>`

Environment variables can be entered in the `.env` file, which is git-ignored.

It is also possible to serve the frontend from HTTPS using the environment variables:
- `KORP_HTTPS=true`
- `KORP_KEY=<path_to_key>-key.pem`
- `KORP_CERT=<path to cert>.pem`

The key and cert can be created using [mkcert](https://github.com/FiloSottile/mkcert).

```
mkcert korp.spraakbanken.gu.se
mkcert -install
```

Now use `korp.spraakbanken.gu.se` as the value for `KORP_HOST`. It must also be added
to `/etc/hosts`.

# Branches, releases and versions

Development is done on the `dev` branch. These changes are not necessarily yet stable and well-tested.

Once tested, they can be merged to the `master` branch in a _release_.

When doing a release:

- Update version in `package.json` to the next version
- Add relevent changes to `CHANGELOG.md`
- Check that the user manual and development documentation is up to date
- Merge `dev` to `master` (using `--no-ff`)
- Tag the merge commit with the new version (prefixed with `v`, see the other tag names)

As an external developer, when forking this respository, you may choose to pull from `dev` and/or `master`, depending on your needs for latest versus stable changes.