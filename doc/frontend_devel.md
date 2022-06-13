# Setting up the Korp Frontend

This section describes how to get the Korp frontend up and running on your own machine and presents the available customization. In this step it is necessary to have a backend with at least one corpus installed. For testing purposes, Språkbankens Korp backend may be enough. It is also assumed that you have a web server available (such as Apache or Nginx).

Download the latest release from [Github](https://github.com/spraakbanken/korp-frontend/releases). The code is distributed under the [MIT license](https://opensource.org/licenses/MIT).

An alternative to downloading a released bundle is to clone the repository:

```
git clone https://github.com/spraakbanken/korp-frontend.git
```

Be sure to use the `master`-branch for production environments.

In this text Korp refers to the frontend only.

## Configuration

In ideal cases, no changes needs to be done in Korp. Instead
all configuration will reside in another directory. 

Throughout this document, `configDir` will refer to either `app` or the configured directory.

### Structure of the configuration directory

The only file that is mandatory to make Korp work is

- `config.yml`

These files are necessary in some cases:
- `modes/*mode.js`
- `translations/*.json`

Mode files should only be necessary for mode with custom functionality (in short, a mode is a collection of corpora that may have different 
  functionality and is described later).

If a new translation key needs to be added, see "Adding Languages" for instructions.

For more advanced use cases there is also the possibility to add own code, styling etc.
in `custom`.

### Make Korp detect the configuration directory

To make Korp detect the configuration directory,
add a file called `run_config.json` file in the root of the Korp repo with the following content:

```
{
    "configDir": "../path/to/my/configuration/directory"
}
```

The directory pointed out should be the one containing `config.yml`.

### Språkbankens configuration

Språkbankens configuration repository is https://github.com/spraakbanken/korp-frontend-sb.
It can be used as a supplement to this documentation. Make sure to check out the branch
corresponding to the branch you are using in the main repository.

## Settings in `config.yml`

In the spring 2022 there was a rewrite where most of the frontend configuration moved to the backend. We also changed format from camel case to
snake case. So `wordpictureTagset` became `word_picture_tagset`. Also `config.js` was turned into a YAML-file, `config.yml`.

Many of the settings listed here can be given in a modes-file in the backend as well. For example `autocomplete` could be wanted in
one mode and not another. Only `korp_backend_url` is mandatory in `config.yml`. The settings one can add to `config.yml` is:

- __korp_backend_url__ - URL to Korps backend. Mandatory. Must be given in `config.yml`.
- __autocomplete__ - 
- __default_language__ - 
- __common_struct_types__ -
- __default_options__ -
- __default_overview_context__ -
- __default_reading_context__ -
- __default_within__ -
- __enable_backend_kwic_download__ - 
- __enable_frontend_kwic_download__ - 
- __group_statistics__ -
- __hits_per_page_values__ -
- __languages__ -
- __map_center__ -
- __map_enabled__ - 
- __news_desk_url__ - 
- __reading_mode_field__ -
- __reduce_word_attribute_selector__ -
- __reduce_struct_attribute_selector__ -
- __visible_modes__ - 
- __word_label__ - 
- __word_picture_tagset__ -
- __word_picture_conf__ -

All configuration parameters are added to a global `settings`-object. For example: 

```
default_language: en
```

Will make `settings["default_language"] available in the app.

### Localization

Add `corpora_<lang>.json` files to `<configDir>/translations` where lang is replaced with a 
language you want to support. It is also possible to put translations
to be used in custom components for extended search and sidebar here.

Files prefixed with `locale` in the code base controls translations that are hard-coded into the 
application and thus it should not be necessary to change these, unless making code changes.

#### Adding Languages

To add a new language in the frontend, for example Lithuanian, add a `corpora-lit.json` 
and `locale-lit.json`. `locale-lit.json` may be copied from an existing locale-file and
then translated. Then add the language in `config.yml`:

```
languages:
  - value: swe
    label: Svenska
  - value: eng
    label: English
```

If for some reason one wants to translate the language names in the language picker, `label` may be an object with translations:

```
label:
  swe: "Svenska"
  eng: "Swedish"
```


To make Lithuanian the default language, use:

`default_language: lit`

##### Angular.js locale

To enable full localization (dates in a date picker, commas instead of dots for decimal separator, etc.), an extra file
is necessary. Download `angular-locale_lt.js` from here:

https://github.com/angular/bower-angular-i18n

Put the file in `<configDir>/translations/`, but rename it using three letter language codes, to: `angular-locale_lit.js`

## Modes

Each Korp installation has a series of _Modes_ in the top left corner, which 
are useful for presenting different faces of Korp that might have different 
layouts or functionality. Modes can either be normal, or be adapted for parallel corpora.
To trigger parallel functionality, `parallel: true`, must be added to `config.yml`, or the
mode-config in the backend.

When Korp is loaded, it looks if there is a mode-given in the `mode` query parameter:

```
https://<frontend url>/?mode=kubhist
```

If no mode is given, mode is `default`. It then asks the backend for settings for this specific mode:

```
https://<backend_url>/corpus_config?mode=kubhist
```

See backend documentation for more information.

## Parallel mode

Additional settings in `config.yml`:

`startLang` - language that should be the default search language.

## Auto completion menu

Korp features an auto completion list for searches in the Simple Search as well as in Extended for those corpus 
attributes configured to use `autoc`-directive (see <#ref autoc|autoc-section>). This is implemented using an 
Angular.js directive `autoc` that calls Karp's auto completion function. Using Karp, Korp can autocomplete senses 
and lemgrams. To disable add the following to `config.yml`:

```
autocomplete: false
```

## Word picture

The word picture-config object looks like this:

```
word_picture_conf:
  pos_tag:
    - table_def1
    - table_def2
    ...
```

where `table_defX` is an array of objects that describe the resulting word picture table. `table_def1` above might look like this:

```
- rel: subject
        css_class: color_blue
      - _
      - rel: object
        css_class: color_purple
      - rel: adverbial
        css_class: color_green
```

The `_` refers to the placement of the lookup word in the table order. The value for `rel` refers to a key in `word_picture_tagset` looking like this:

```
word_picture_tagset:
    subject: ss
    object: obj
    adverbial: adv
    preposition_rel: pa
    pre_modifier: at
    post_modifier: et
    adverbial2: aa
    ...
```

The values are the actual relations returned by the backend. The relation used is determined by `field_reverse`. If `field_reverse` is `false` (default), `dep` is used, else `head`. If you find yourself with a table full of the search word just flip the `field_reverse` switch.

`css_class` simply gives a class to the column, useful for applying background color. The last supported attribute is `alt_label`, used for when another value than the relation name should be used for the table header.

- `wordpicture` - `boolean`. The word picture should be enabled/disabled.

## Map

Korp's map uses annotations to get locations. The user selects rows from the statistics table and points derived from different rows will have different colors. The selected corpora must have structural attributes with location data in them. The format is `Fukuoka;JP;33.6;130.41667` - the location name, the country, latitude and longitude separated by `;`.

    Also the name of the attribute must contain `"__"` and `"geo"` to show up in the list of supported attributes.

- `map_enabled` - `boolean`. The map should be enabled/disabled.
- `map_center` - Where the center of the map should be located when user opens map. Example:  

```
map_center:
  lat: 62.99515845212052
  lng: 16.69921875
  zoom: 4
```


## News widget

By setting `news_desk_url`, the news widget is enabled. The widget simply fetches a JSON-file from the given URL. Short example of such a file, including only one news item with its title and body in two languages and a date:

    [
        {
            "h": {
                "en": "<p>Longer description in English</p>",
                "sv": "<p>Längre beskrivning på svenska</p>"
            },
            "t": {
                "en": "English Title",
                "sv": "Svensk Titel"
            },
            "d": "2017-03-01"
        }
    ]

Local storage is used to remember when the user last checked the news. If there are new items, the UI will change to reflect this.

## Customizing

### Localization

Korp does runtime DOM manipulation when the user changes language. Using an Angular filter to specify which translation key looks like this:

    <div>{{'my_key' | loc}}</div>

Sometimes it is neccessary to use `loc:lang` or even `loc:$root.lang`, instead of just `loc`.

Add `my_key` to `<configDir>/translations/corpora-<lang>.json` for all `lang`.

[Deprecation warning] Before the Angular approach we used the `rel` attribute, like so (but you shouldn't any more):
  `<span rel="localize[translation_key]">...</span>`

#### Components

Define your own components as a map in `custom/components.js`. `component` will be added as a component with name `componentName` to the Angular app.


```
import component from 'custom/myComponentFile'

export default {
	componentName: component
}
```


These can then be used in other custom components / extended / sidebar or as reading mode-components.

Remember that in Angular, if you use `myComponentName` as a name of a component, you must use 
`my-component-name` when using the component in markup.

#### Customizing extended search

In `custom/extended.js`, we can define custom (non-Angular) components to be used in extended search:

```
export default {
    complemgramExtended: {
        template: `<input type="text" ng-model="model" />
        `,
        controller: [
            "$scope", function($scope) {
                $scope.$watch("input; () => ...)
                ...
        }],
    },
    attr: {
        template: `
            <select ...>
        `,
        controller: ["$scope", "$uibModal", function($scope, $uibModal) {
            if($scope.show) $uibModal.open
        }
    },
    ...
}
```

Template is an Angular.js template string and controller is an Angular.js controller function.

Make sure to set `$scope.model` as the final result to be used in the CQP-query.

`complemgramExtended` can then be used as key for `extendedComponent` in the configuration files.

```
attributes: {
    complemgram: {
        label: "Compounds",
        extendedComponent: "complemgramExtended",
    }
}
```

##### escaper

`escaper` is a directive that takes the user's input and escapes any regexp characters before saving it to `scope.model`. 
When the model changes it automatically de-escapes any regexp characters before showing the value to the user. 
Input must be saved to `scope.input` for it to work. Example: `<input ng-model="input" escaper>`


##### Customizing sidebar

In `custom/sidebar.js`, we can define custom components to be used in the sidebar:

```
export default {
    imageSidebar: {
        template: `<img ng-src="myImg" />
        `,
        controller: [
            "$scope", function($scope) {
                $scope.myImg = $scope.sentenceData["text_mediafilepath"]
                ...
        }],
    },
    ...
}
```

Useful for having e.g. a modal window pop up, or for rendering a small video player in the sidebar, or for anything else that isn't simple text or a link. Also when combining values from several attributes.

Use `imageSidebar` as key for `sidebarComponent` in the configuration files.

Data about the search, the current token and current attribute is stored in a number of variables on `$scope`:

- `$scope.type`: "struct" / "pos", the type of the attribute
- `$scope.key`: Name of the attribute
- `$scope.value`: Value of the attribute
- `$scope.attrs`: The attribute definition from the config
- `$scope.wordData`: The values of the positional attributes for current token
- `$scope.sentenceData`: The values of the structural attributes for current token / structure
- `$scope.tokens`: All the tokens in the current sentence

The component not an actual Angular.js component. It will be added to the interface by manually creating a new scope and using `$controller` to instantiate the controller and `$compile` to instantiate the template.

#### Rendering attribute values in the statistics-view

Define your own rules for rendering values and generating CQP-expressions for certain attributes.

When configuring an attribute that needs special handling, use the `stats_cqp` and `stats_stringify` keywords:

```
const myAttribute = {
    label: "category",
    order: 80,
    stats_stringify: "customStringify",
    stats_cqp: "customCQP",
}
```

Then create `custom/statistics.js` and define the functions there:

```
export default {
    customStringify: (values) => values.join(' == '),
    customCQP: (tokens) => "(" + tokens.map(item => `_.cat="${item}"`).join(" | ") + ")",
}
```

Rendering values and generating CQP can also be controlled by editing `app/config/statistics_config.js`, but 
of course it is best to avoid editing the actual code if it is possible.

#### Stringify functions

Add all custom pretty-printing to `custom/stringify.js`. Example file:

```
export const {
    sense: (sense) => util.saldoToString(sense, true),
    lemgram: (str) => util.lemgramToString(str, true),
    complemgram: (str) => str.split('+').map((lemgram) => util.lemgramToString(lemgram, true)).join('+')
}
```

Note that no changes in the attribute-configuration is needed here. Korp will pick up the functions automatically
based on the name of the attribute. Will be used in sidebar, statistics, extended, etc.

### Reading mode

Enable the standard reading mode by using this setting on a corpus:

  ```
  readingMode: {
        component: "standardReadingMode"
    }
  ```

When clicking on a row in the KWIC a link will be added to the sidebar. Clicking this link opens a new tab where the entire text is shown.

Prerequisites are:
- A structural attribute identifying the currently selected row in the KWIC. This may be configured with `settings.readingModeField`, default is `sentence_id`.
- `_head` and `_tail` attribute on each token. These attributes contain the whitespace before and after a token.

It is possible to write a custom reading component. See <https://github.com/spraakbanken/korp-frontend/blob/dev/app/scripts/components/readingmode.js> for an example.


# Developing the Korp Frontend

Here is where we present details on how to do code changes in Korp. Changes that improve the code base in may be submitted using pull requests on Github.

## About the code

### Settings

Use `snake_case` when defining new attribute in `config.yml`. Add a default  value for the new attribute in `app/scripts/settings.js`, if needed.

When using the settings object, use the following format: `settings["my_setting"]`, instead of `settings.my_setting`. This is to emphasize that `settings` should be viewed as a data structure that is holding values, and to avoid using snake case in code.

### Map

Some of the code for the map is located in this repository:

https://github.com/spraakbanken/korp-geo

[github-frontend]: https://github.com/spraakbanken/korp-frontend/
[github-frontend-sb]: https://github.com/spraakbanken/korp-frontend-sb/

## Contributing with pull requests on Github

### Issues

It is OK to create a pull request without a corresponding issue, but if the pull request aims to fix an issue, it should be clearly stated.

Discussions can be made in the pull request.

### Branching

In general, the pull request should be for the `dev`-branch.

If the pull request is a fix for a critical bug, a pull request can be made for `master`. The changes should of course also be merged to the `dev`-branch, but this willl be made by Språkbanken.

### Description

Try to answer these questions in your pull request description:

- What has been changed?
- Why was the change made? (Can be excluded, if it is obvious).

### Commits

The pull request may include changes on multiple topics, if they are related. It is OK to include as many commits as needed in the request. The commits will not be squashed when merging.

### Dependencies

If the commit depends on new functions in the backend, add a note of which backend version/commit, is needed for the code to work.

## Contributing - content

### Code format

The code should be formatted using Prettier, with the supplied `.prettierrc`. It is possible to make your editor do this automatically on save. Otherwise, run prettier before commiting (`yarn run prettier app/scripts/my_file.js`).

We use [Babel](https://babeljs.io/) to transform modern Javascript to something that works in all browsers. A non-exhaustive list of features available is: https://babeljs.io/docs/en/learn .

Use modern features where it looks good. Always use `const` or `let` instead of `var`.

Identifiers should be in camel case (although our old Korp code may have some identifiers that uses snake case left).

Aim to write code that is easily understood, and supplement with comments as needed. Update comments as a part of a pull request when something changes so that the comments are no longer valid.

### Dependencies

Do not add new dependencies to `package.json`, unless it cannot absolutely be avoided, and the new dependency is a widely used library in active development.

### Angular

We strive to write everything that is possible as an Angular component: https://docs.angularjs.org/guide/component

Avoid using directives and controllers.

### Documentation

Update this document if needed.

### Testing

The state of the frontend testing is quite bad. It is good to add e2e tests in `test/e2e/spec`, but not a demand. The tests are dependent on Språkbankens frontend setup, Korp backend and Karp backend (auto completion feature).
