# Setting up the Korp Frontend

## Running

To run Korp frontend the following is needed:
- A [Korp backend](https://github.com/spraakbanken/korp-backend/) with corpora installed and configured 
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

The easiest way to try the frontend locally is to:
- Clone and go to the root of this repository (<https://github.com/spraakbanken/korp-frontend>) on your machine
- Run `yarn` to install dependencies
- Follow the instructions under [Configuration](#configuration). At least a `config.yml` is needed.
- Run `yarn start`

`yarn start` uses [Webpack DevServer](https://webpack.js). It builds the code and starts 
a web server locally, by default on port `9111`.  When the configuration is changed, the server automatically
rebuilds everything. This makes testing your setup really easy.

## Building

When the frontend instance feels ready to deploy, the code must be built for production using: 

```
yarn build
```

The build is put in the `dist`-directory. The build only contains resources that any
browser understands, such as HTML, Javascript, CSS, images and fonts. Therefore you can try out the build locally by using any web server,
Node.js and the development dependencies are not needed anymore.

A really easy way if you have Python (version 3) installed, is:

```
cd dist; python -m http.server 8080
```

If everything still works as expected, the contents of `dist` can be deployed to production.

## Configuration

In ideal cases, no changes needs to be done in the frontend code. Instead
all configuration will reside in another directory. 

Throughout this document, `configDir` will refer to either `app` or the configured directory.

### Structure of the configuration directory

The only file in the configuration directory that is mandatory to make Korp work is:

- `config.yml`

These files are necessary in some cases:
- `modes/*mode.js`
- `translations/*.json`

Mode files should only be necessary for modes with custom functionality (in short, a mode is a collection of corpora that may have different 
  functionality and is described later).

If a new language needs to be added, see [Adding Languages](#adding-languages) for instructions.

For more advanced use cases there is also the possibility to custommize by adding add own code or styling, see [Customizing](#customizing).

### Using a configuration directory

To use a configuration directory,
add a file called `run_config.json` file in the root of the repository with the following content:

```
{
    "configDir": "../path/to/my/configuration/directory"
}
```

The directory pointed out should be the one containing `config.yml`.

### Språkbanken's configuration

Språkbanken's configuration repository is <https://github.com/spraakbanken/korp-frontend-sb>.
It can be used as a supplement to this documentation. Make sure to check out the branch
corresponding to the branch you are using in the main repository.

## Settings in `config.yml`

*Note: In the spring 2022 there was a rewrite where most of the frontend configuration moved to the backend. We also changed format from camel case to
snake case. So `wordpictureTagset` became `word_picture_tagset`. Also `config.js` was turned into a YAML-file, `config.yml`.*

Many of the settings listed here can be given in a modes-file in the backend instead of `config.yml`. For example `autocomplete` could be wanted in
one mode and not another. See the 
[backend documentation](https://github.com/spraakbanken/korp-backend) for more 
settings that affect the frontend.

**Attributes that must be added to `config.yml`, and doesn't work in modes-files:**

- __korp_backend_url__ - URL to Korp's backend
- __languages__ - Array of objects with language code and translation of supported UI languages, for example:
    ```
    - value: eng
      label: English
    - value: swe
      label: Svenska
    ```

**Others:**

- __autocomplete__ - Boolean. See [auto completion menu](#auto-completion-menu)
- __corpus_config_url__ - String. Configuration for the selected mode is fetched from here at app initialization. If not given, the default is `<korp_backend_url>/corpus_config?mode=<mode>`, see the [`corpus_config`](https://ws.spraakbanken.gu.se/docs/korp#tag/Information/paths/~1corpus_config/get) API.
- __corpus_info_link__ - Object. Use this to render a link for each corpus in the corpus chooser.
  - __url_template__ - String or translation object. A URL containing a token "%s", which will be replaced with the corpus id.
  - __label__ - String or translation object. The label is the the same for all corpora.
- __default_language__ - String. The default interface language. Default: `"eng"`
- __common_struct_types__ - Object with attribute name as a key and attribute definition as value. Attributes 
    that may be added automatically to a corpus. See [backend documentation](https://github.com/spraakbanken/korp-backend)
    for more information about how to define attributes.
- __default_options__ - See [Operators](#operators).
- __default_overview_context__ - The default context for KWIC-view. Use a context that is supported by the majority of corpora in the mode (URLs will be shorter). E.g.: `"1 sentence"`. For corpora that do not support this context an additional parameter will be sent to the backend based on the `context`-setting in the corpus.
- __default_reading_context__ - Same as __default_overview_context__, but for the context-view. Use a context larger than the __default_overview_context__.
- __default_within__ - An object containing the structural elements of a corpus. `default_within` is used unless a corpus overrides the setting using `within`. Example:
    ```
    default_within:
      sentence: sentence
    ```
    In simple search, we will search within the default and supply extra information for the corpora that do not support the default.

    In extended search, the default `within` will be used unless the user specifies something else. In that case the user's choice will be used for all corpora that support it and for corpora that do not support it, a supported `within` will be used.
- __enable_backend_kwic_download__ - Boolean. Backend download, depends on backend download functionality.
- __enable_frontend_kwic_download__ - Boolean. Frontend download. Gives CSV created by same data as available in the KWIC.
- __group_statistics__ - List of attribute names. Attributes that either have a rank or a numbering used for multi-word units. For example, removing `:2` from `ta_bort..vbm.1:2`, to get the lemgram of this word: `ta_bort..vbm.1`.
- __has_timespan__ - Boolean. If the backend supports the `timespan` call, used in corpus chooser for example. Default: `true`
- __hits_per_page_values__ - Array of integer. The available page sizes. Default: `[25, 50, 75, 100]`
- __hits_per_page_default__ - Integer. The preselected page size. Default: `hits_per_page_values[0]`
- __iso_languages__ - A map of two-letter ISO language codes to three-letter. Only used for fixing old links. Default: See `settings.js`
- __map_center__ - See [Map](#map)
- __map_enabled__ - Boolean. See [Map](#map)
- __matomo__ - Object. Enable analytics with a [Matomo](https://matomo.org/) instance.
  - __url__: String. The URL of the Matomo instance, including trailing slash.
  - __site__: Integer. The site ID that Matomo has assigned for the Korp instance.
  - It is also possible to override each value underneath keys corresponding to `ENVIRONMENT` values, e.g:
      ```
      matomo:
        url: https://matomo.example.com/
        site: 1
        production:
          site: 2
      ```
- __news_desk_url__ - See [News widget](#news-widget)
- __visible_modes__ - Integer. The number of modes to show links to. If there are more modes than this value, the rest will be added to a drop-down. Default: `6`
- __statistics_search_default__ - Boolean. Decides if "Show statistics" will be checked or not when loading Korp. Default: `true`
- __stats_rewrite__: A function that takes the array `[data, columns, searchParams]`, modifies and returns it.
- __word_label__ - Translation object. Translations for "word". Add if you need support for other languages. Default:
    ```
    swe: ord
    eng: word
    ```
- __word_picture__ - Boolean. Enable/disable the word picture. 
- __word_picture_tagset__ - See [Word picture](#word-picture)
- __word_picture_conf__ - See [Word picture](#word-picture)


- __word_attribute_selector__ - String, `union` / `intersection`. In extended search, attribute list, show all selected corpora *word* attributes or only the attributes common to selected corpora.
- __struct_attribute_selector__ - Same as __word_attribute_selector__, but for structural attributes.
- __reduce_word_attribute_selector__ - Same as __word_attribute_selector__, but for the "compile based on"-configuration in statistics. **Warning:** if set to `"union"`, the statistics call will fail if user selects an attribute that is not supported by a selected corpus.
- __reduce_struct_attribute_selector__ - Same as __reduce_word_attribute_selector__, but for structural attributes.

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

To enable full localization (dates in a date picker, commas or dots for decimal separator, etc.), an extra file
is necessary. Download `angular-locale_lt.js` from here:

https://github.com/angular/bower-angular-i18n

Put the file in `<configDir>/translations/`, but rename it using three letter language codes, to: `angular-locale_lit.js`

## Modes

Each Korp installation has a series of _Modes_ in the top left corner, which 
are useful for presenting different faces of Korp that might have different 
layouts or functionality. Modes can either be normal, or be adapted for parallel corpora.
To trigger parallel functionality, `parallel: true`, must be added to `config.yml`, or the
mode-config in the backend.

When Korp is loaded, it looks for the `mode` query parameter:

```
https://<frontend url>/?mode=kubhist
```

If no mode is given, mode is `default`.

It then looks for mode-specific code in `<configDir>/modes/<mode>_mode.js`. Mode code may overwrite values from `config.yml` by altering the `settings` object imported from `@/settings`.

It then looks for settings for this specific mode, the **corpus config**. If it exists at `<configDir>/modes/<mode>_corpus_config.json`, it will be loaded from there. Otherwise, it retrieves it from the url given by the `corpus_config_url` option, which defaults to:

```
https://<korp_backend_url>/corpus_config?mode=<mode>
```

See the [`corpus_config`](https://ws.spraakbanken.gu.se/docs/korp#tag/Information/paths/~1corpus_config/get) API for more information.

## Parallel mode

Additional settings in `config.yml` (may also be given by the backend for the mode):

`start_lang` - language that should be the default search language.

## Auto completion menu

Korp features an auto completion list for searches in the Simple Search as well as in Extended for those corpus 
attributes configured to use `autoc`-directive. This is implemented using an 
Angular.js directive `autoc` that calls [Karp](https://spraakbanken.gu.se/en/tools/karp)'s auto completion function. 
Using Karp, Korp can autocomplete senses and lemgrams. To disable add the following to `config.yml`:

```
autocomplete: false
```

## Sidebar

When clicking on a word in the KWIC (or text in the reading mode), a sidebar appears with information about the 
current word. By default, all the attributes listed under `pos_attributes`, `struct_attributes` and `custom_attributes` are shown. Which attributes to show and how they should be displayed are customizable. See [Attribute settings](#attribute-settings).

The order of the attributes arrays determine the order in the sidebar. Custom attributes are 
added to the end of their respective category.

## Extended components

The frontend features a number of components that can be used for the attributes in extended search. For example, dropdowns with
a static list of search alternatives, autocompletion menus etc. 

The following examples are in YAML, that is used in the backend configuration. Simple usage:

```
attribute_name:
  extended_component: autocExtended
```

Some of the components have support for options. This is the format to use then:

```
attribute_name:
  extended_component:
    name: datasetSelect
    options:
      sort: false
```

If none of the built in components fit the use case, see [customizing extended search](#customizing-extended-search).

The built in components are:

### datasetSelect

Supported options:
- **sort**, default is **true**

### structServiceSelect

To be documented

### structServiceAutocomplete

To be documented

### singleValue

To be documented

### default

To be documented

### autocExtended

To be documented

### dateInterval

There is a built-in component for searching time intervals in extended search.

To use it, simply set `extended_component: dateInterval` in the attribute's configuration.

There is also another possibility. If the corpus has time data enabled, as explained here:

https://github.com/spraakbanken/korp-backend#time-data

Then time interval will be added automatically as a search alternative, but this needs to be added to `config.yml`:

```
common_struct_types:
  date_interval:
    label: "time interval"
    hide_sidebar: 'true'
    hide_compare: 'true'
    hide_statistics: 'true'
    opts: false
    extended_component: dateInterval
```

## Operators

`default_options` lists the most common set of wanted operators in extended search. They will be used unless an
attribute specifies another set of operators using `opts`.

Språkbanken's `default_options` is:
```
default_options:
  is: =
  is_not: '!='
  starts_with: ^=
  contains: _=
  ends_with: '&='
  matches: '*='
  matches_not: '!*='
```

The values in this object refers to internal operators used by Korp frontend only. The purpose of the internal operators are, for 
example, to know if values need to be escaped/unescaped with regards to special regexp characters.

The object above is suitable for simple words/strings where one can be interested in searching for affixes.

If there is a known value set of an attribute, as for example in POS-tagging, this is a suitable value for `opts`:

```
opts:
  is: "="
  is_not": "!="
```

And if the attribute has a set of values instead of a single one, but regexp and affixes should be supported, this:

```
opts:
  contains: incontains_contains
  ends_with: ends_with_contains
  is: contains
  is_not: not contains
  matches": regexp_contains
  matches_not": not_regexp_contains
  starts_with": starts_with_contains
```

And if no regexp or affix-search is needed:

```
opts:
  is: contains
  is_not: not contains
```

The keys in these objects are translation keys and the values are used in an internal "CQP-format". The values will be translated to 
proper CWB-supported operators before being sent to the backend. For example `regexp_contains` will be translated to just `contains`,
while the operand will not be escaped. `starts_with_contains`, will be translated to `contains` and the operand will be escaped and then have `.*` added
to the end.


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

## Map

Korp's map uses annotations to get locations. The user selects rows from the statistics table and points derived from different rows will have different colors. The selected corpora must have structural attributes with location data in them. The format is `Fukuoka;JP;33.6;130.41667` - the location name, the country, latitude and longitude separated by `;`.

    Also the name of the attribute must contain `"__"` and `"geo"` to show up in the list of supported attributes.

- `map_enabled` - Boolean. Enable/disable the map functionality.
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

## Authentication

Korp comes with two implementations of login. Choose implementation using `auth_module` in `config.yml.

Either just give your chosen implementation like this:

`auth_module: "name"`

Or as an object, if options are needed:

```
auth_module:
  module: "name"
  options:
    an_option: true
```

### Basic authentication

The module name is `basic_auth`. This is the default implementation. It has two options:

- **show_remember**: Default `true`. Whether or not to show the "Remember me" option. 
- **default_value_remember**: Default `false`. If the remember checkbox is ticke or not by default

If the login should be remembered, the user's credentials are stored in local storage.

### Federated authentication

The module name is `federated_auth`. It checks if a JWT is available at an endpoint and uses the JWT in
any subsequent communication with the backend. If the user clicks Login, they are redirected to 
a login service. If the user clicks Logout, they are redirected to a logout service. The options are:

- **jwt_url**
- **login_service**
- **logout_service**

### Custom

It is possible to define your own authentication module and set this using `auth_module`. The code should be
located in `custom/` and support the functions used in `components/auth.js`.

## Attribute settings

Corpora and their attrbutes are configured in the backend, but most of the
available settings are frontend related. These are the available configuration
parameters for attributes.

### Possible settings for `pos_attributes` and `struct_attributes`

- **label**: Label to display wherever the attribute is shown.
- **display_type**: Set to `hidden` to fetch attribute, but never show it in the frontend. 
  See `hide_sidebar`, `hide_statistics`, `hide_extended` and `hide_compare` for more control.
- **extended_component**: For available components, see [extended components](#extended-components). For writing custom components, see [customizing extended search](#customizing-extended-search).
- **external_search**: Link with placeholder for replacing value. Example `https://spraakbanken.gu.se/karp/#?search=extended%7C%7Cand%7Csense%7Cequals%7C<%= val %>`
- **group_by**: Set to either `group_by` or `group_by_struct`. Should only be needed for attributes with `is_struct_attr: true`.
  Those attributes are by default sent as `group_by_struct` in the statistics, but can be overridden here.
- **hide_sidebar**: `boolean`. Default `false`. Hide attribute in sidebar.
- **hide_statistics**: `boolean`. Default: `false`. Should it be possible to compile statistics based on this attribute?
- **hide_extended**: `boolean`. Default: `false`. Should it be possible to search using this attribute in extended?
- **hide_compare**: `boolean`. Default: `false`. Should it be possible to compare searches using this attribute?
- **internal_search**: `boolean`. Should the value be displayed as a link to a new Korp search? Only works for sets.
  Searches for CQP-expression: `[<attrName> contains "<regescape(attrValue)>"]`
- **is_struct_attr**: `boolean`. If `true` the attribute will be treated as a structural attribute in every sense except
  it will be included in the `show` query parameter instead of `show_struct` for KWIC requests. Useful for structural 
  attributes that extend to smaller portions of the text than the selected context, such as name tagging.
- **opts**: this represents the auxiliary select box where you can modify the input value.
  See [Operators](#operators) section for format and more information.
- **order**: Order of attribute in the sidebar. Attributes with a lower `order`-value will be placed above attributes
  with a higher `order`-value.
- **pattern**: HTML snippet with placeholders for replacing values. Available is `key` (attribute name) and `value`.
  Also works for sets. Example: `'<p style="margin-left: 5px;"><%=val.toLowerCase()%></p>'`
- **sidebar_component**: See [Customizing sidebar](#customizing-sidebar).
- **sidebar_info_url**: `string` (URL). If defined and non-empty, add an info symbol ⓘ for the attribute in the
  sidebar, linking to the given URL. This can be used to link to an explanation page for morphosyntactic tags, for example.
- **sidebar_hide_label**: `boolean`. If `true`, do not show the localized attribute label and the colon following it in the
  sidebar, only the attribute value. This can be used, for example, if the `pattern` for the attribute includes the label but
  the label should be shown in the attribute lists of the extended search or statistics.
- **stats_cqp**: See [Rendering attribute values in the statistics view](#rendering-attribute-values-in-the-statistics-view).
- **stats_stringify**: See [Rendering attribute values in the statistics view](#rendering-attribute-values-in-the-statistics-view).
- **translation**: An object containing translations of possible values of the attribute, in this format:
    ```
    {
        "ROOT": {
            "en": "Root",
            "sv": "Rot"
        },
        "++": {
            "en": "Coordinating conjunction",
            "sv": "Samordnande konjunktion"
        },
        "+A": {
            "en": "Conjunctional adverbial",
            "sv": "Konjuktionellt adverb"
        },
        ...
    }
    ```
    This replaces value-translation in the translation-files, and also the old attribute `translationKey`.
- **type**: Possible values:
    - "set" - The attribute is formatted as "|value1|value2|". Include contains and not contains in `opts`.
              In the sidebar, the value will be split before formatted. When using compile / `groupby` on a "set"
              attribute in a statistics request, it will be added to `split`.
    - "url" - The value will be rendered as a link to the URL and possibly truncated if too long.

### Custom attributes

Custom attributes are attributes that do not correspond to an attribute / annotation in the backend. They are mainly used to present information in the sidebar that combines values from other attributes.

- **custom_attributes**: creates fields in the sidebar that have no corresponding attribute in the backend. Useful for combining two different attributes. All settings concerning sidebar format for normal attributes apply in addition to:
  - **custom_type**: `"struct"` / `"pos"` - decides if the attribute should be grouped under word attributes or text attributes.
  - **pattern**: Same as pattern for normal attributes, but `struct_attrs` and `pos_attrs` also available. Example: `'<p style="margin-left: 5px;"><%=struct_attrs.text_title - struct_attrs.text_description%></p>'`

## Customizing

### Localization

Korp does runtime DOM manipulation when the user changes language. Using an Angular filter to specify which translation key looks like this:

    <div>{{'my_key' | loc}}</div>

Sometimes it is necessary to use `loc:lang` or even `loc:$root.lang`, instead of just `loc`.

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

*Note: The component not an actual Angular.js [component](https://docs.angularjs.org/guide/component). It will be added to the interface by manually creating a new scope and using `$controller` to instantiate the controller and `$compile` to instantiate the template.*

#### Rendering attribute values in the statistics view

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

If you need to merge rows or otherwise alter the table structure, implement and assign a function to the `stats_rewrite` setting.

#### Stringify functions

Add all custom pretty-printing to `custom/stringify.js`. Example file:

```
import { lemgramToHtml, saldoToHtml } from "@/util"

export const {
    sense: (sense) => saldoToHtml(sense, true),
    lemgram: (str) => lemgramToHtml(str, true),
    complemgram: (str) => str.split('+').map((lemgram) => lemgramToHtml(lemgram, true)).join('+')
}
```

Note that no changes in the attribute-configuration is needed here. Korp will pick up the functions automatically
based on the name of the attribute. Will be used in sidebar, statistics, extended, etc.

### Reading mode

Enable the standard reading mode by using this setting on a corpus:

```
reading_mode: true
```

When clicking on a word in the KWIC a link will be added to the sidebar. Clicking this link opens a new tab where the entire text is shown.

The corpus must have the structural attribute `text__id`, which should be a unique ID in the corpus. `_head` and `_tail` are also needed and should contain the whitespace before and after the token. It is optional to put whitespace in both attributes. The simplest use case is to just put the trailing whitespace in `_tail` of that token and leave `_head` empty. The frontend will assume that any corpus with `reading_mode: true` will have these attributes.

It is possible to write a custom reading component. See [this file](https://github.com/spraakbanken/korp-frontend/blob/dev/app/scripts/components/readingmode.js) for an example. See [Components](#components) for documentation on custom components.


# Developing the Korp Frontend

Here is where we present details on how to do code changes in Korp. Changes that improve the code base in may be submitted using pull requests on Github.

## About the code

### Settings

All configuration parameters in `config.yml` are added to a global `settings`-object. For example:

```
my_parameter: my value
```

Will make `settings["my_parameter"]` available in the app.

Use `snake_case` when defining new attribute in `config.yml`. Add a default  value for the new attribute in `app/scripts/settings.js`, if needed.

When using the settings object, use the following format: `settings["my_parameter"]`, instead of `settings.my_parameter`. This is to emphasize that `settings` should be viewed as a data structure that is holding values, and to avoid using snake case in code.

### Map

Some of the code for the map is located in this repository:

https://github.com/spraakbanken/korp-geo

[github-frontend]: https://github.com/spraakbanken/korp-frontend/
[github-frontend-sb]: https://github.com/spraakbanken/korp-frontend-sb/

### CQP Parser

CQP queries are of course parsed in the backend to perform searching. But they are also parsed in the frontend, for programmatic manipulation etc. The frontend parser is written in [Peggy](https://peggyjs.org/) syntax: [CQPParser.peggy](../app/scripts/cqp_parser/CQPParser.peggy). It covers only some of the full CQP syntax supported by the backend, and it is quite expected to throw errors when parsing user-crafted queries.

To rebuild JS code from the Peggy file, do:

```sh
cd app/scripts/cqp_parser
npx peggy --format es -d _:lodash CQPParser.peggy
```

## Contributing with pull requests on Github

### Issues

It is OK to create a pull request without a corresponding issue, but if the pull request aims to fix an issue, it should be clearly stated.

Discussions can be made in the pull request.

### Branching

In general, the pull request should be for the `dev`-branch.

If the pull request is a fix for a critical bug, a pull request can be made for `master`. The changes should of course also be merged to the `dev`-branch, but this will be made by Språkbanken.

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

The code should be formatted using Prettier, with the supplied `.prettierrc`. It is possible to make your editor do this automatically on save. Otherwise, run prettier before committing (`yarn run prettier app/scripts/my_file.js`).

We use [Babel](https://babeljs.io/) to transform modern Javascript to something that works in all browsers. A non-exhaustive list of features available is: https://babeljs.io/docs/en/learn .

Use modern features where it looks good. Always use `const` or `let` instead of `var`.

Identifiers should be in camel case (although our old Korp code may still have some identifiers that uses snake case).

Aim to write code that is easily understood, and supplement with comments as needed. Update comments as a part of a pull request when something changes so that the comments are no longer valid.

Files should be named using snake case: `my_file.js`.

### Dependencies

Do not add new dependencies to `package.json`, unless it cannot absolutely be avoided, and the new dependency is a widely used library in active development.

### Angular

We strive to write everything that is possible as an Angular component: https://docs.angularjs.org/guide/component

Avoid using directives and controllers.

#### Angular.js dependency injection

This is how it looks everywhere in the Angular.js code:

```
controller: [
  "$scope",
  "$rootScope",
  "backend",
  ($scope, $rootScope, backend) => {
    ...
  }
]
```

The variables of the controller is created automatically by Angular.js and "injected". When reading documenation online you can find the alternative:

```
controller: ($scope, $rootScope, backend) => {
  ...
}
```

But this doesn't work in Korp (anymore). Due to minification done by Webpack when building the frontend (`yarn build`). It probably works with `yarn start`, so beware.

### Documentation

Update this document if needed.

### Testing

The state of the frontend testing is quite bad. It is good to add e2e tests in `test/e2e/spec`, but not a demand. The tests are dependent on Språkbanken's frontend setup, Korp backend and Karp backend (auto completion feature).
