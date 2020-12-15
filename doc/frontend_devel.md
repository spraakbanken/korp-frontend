# Setting up the Korp Frontend

This section describes how to get the Korp frontend up and running on your own machine and presents the available customization. In this step it is necessary to have a backend with at least one corpus installed. For testing purposes, Språkbankens Korp backend may be enough. It is also assumed that you have a web server available (such as Apache or Nginx).

Download the latest release from [Github](https://github.com/spraakbanken/korp-frontend/releases). The code is distributed under the [MIT license][MIT].

An alternative to downloading a released bundle is to clone the repository:

```
git clone https://github.com/spraakbanken/korp-frontend.git
```

Be sure to use the `master`-branch for production environments.

In this text Korp refers to the frontend only.

## Configuration

In ideal cases, no changes needs to be done in Korp. Instead
all configuration will reside in another directory. How to make the build
system detect this directory and its contents will be described below.

### Make Korp detect the configuration directory

To make Korp detect the configuration directory,
use a `run_config.json` file in the root of the Korp repo with the following content:

```
{
    "configDir": "../path/to/my/configuration/folder"
}
```

### Structure of the configuration directory

The following type of files are needed to make Korp work properly. They
are all described in the documentation.

- `config.js`
- `modes/common.js`
- `modes/*mode.js`
- `translations/*.json`

(In short, a mode is a collection of corpora that may have different 
  functionality and are described later).

For more advanced use cases there is also the possibility to add scripts,
 styling and HTML-templates/snippets.
 
 - `styles/`
 - `scripts/`
 - `views/`
 
 Styles and scripts will be automatically loaded. 
 Files matching `views/*.html` can be loaded manually by requiring them 
 using the name `customtemplates`. The result will be a string containing 
 the (minified) HTML, for example, a template for an Angular 
 directive: `template: require("customviews/my_view.html")`. If you are not
 writing any custom scripts (i.e. files in `scripts/`), this can be
  completely ignored.

### Content of `config.js`

The main configuration file of Korp is `config.js`. In this file we have 
configuration for where the backend is located, what features should be turned 
on or off etc. Corpora configuration is done in the modes files. There is more 
information about that later in this document.

All configuration parameters are added to a global `settings`-object. For example: 

```
settings.defaultLanguage = "en"
```

Available settings will be described in feature sections and there is also a 
[summary of all settings](#summary-settings). A good start could be to just
copy `config.js` from this repository to your configuration directory.

### Content of `modes/common.js`

After `config.js`, but before any mode configuration, `modes/common.js` is 
loaded. This may include definitions which are used in several modes s.a. a set 
of attributes. This helps to keep `config.js` clean. This file must export any 
variables that can be used in a mode.

```
var veryCommonAttributes = {
  pos: {
    label: "pos",
    order: 600
  }
}
module.exports = {
  veryCommonAttributes
}
```

Now very `veryCommonAttributes` will be available in all mode-files.

### Localization

In `app/translations` there are several files containing translations for 
different parts of the application.

Files prefixed with `locale` and controls translations are hard-coded into the 
application and thus it should not be necessary to change these if only 
customization is done. The files prefixed with  `corpora` however are
translations of corpora attributes and values and must be replaced with data
suitable for the specific set of corpora the Korp installation serves. The 
files are JSON structures that for each language ties a __translation key__ 
to a particular __string__ in that language. You should start with empty corpora
translation files and then add the translations as you add corpora. 

The translations folder also contains Python script - `check_locale_files.py` - 
that makes sure that each set of translation files has each translation key 
present in all different languages.

#### Adding Languages

To add a new language in the frontend, for example Lithuanian, add a `corpora-lt.json` and `locale-lt.json`. `locale-lt.json` may be copied from an existing locale-file and then translated. Then add the language in `config.js`:

    `settings.languages = ["sv", "en", "lt"];`

To make Lithuanian the default language, use:

    `settings.defaultLanguage = "lt"`

To add a button in the interface for Lithuanian, open
`includes/header.pug` and look for:

```
a(data-mode='en', ng-click="lang = 'en'") {{'english' | loc:lang}}
```

and copy this line, substituting `en` for `lt`
where applicable.

##### Angular.js locale

To enable full localization (dates in a datepicker for example), an extra file
is necessary. Download `angular-locale_lt.js` from here:

[Angular i18n][angular-i18n]

Put the file in `app/translations/`.

## Modes

Each Korp installation has a series of _Modes_ in the top left corner, which 
are useful for presenting different faces of Korp that might have different 
layouts or functionality. In the Swedish version the parallel corpora have their
own mode because their KWIC results don't mix particularly well with the 
'normal' results.

#### Adding modes

Relevant setting fields are `settings.visibleModes` and `settings.modeConfig`. The former controls how many modes are visible in the header (the rest are hidden away in a menu). The latter looks like this:

    [
      {
        localekey: "modern_texts", 
        mode: "default"
      },
      {
        localekey: "parallel_texts", 
        mode: "parallel"
      },
      {
        localekey: "faroese_texts", 
        mode: "faroe"
      }
    ]


The `localeKey` key corresponds to a key from the localization files. The `mode` key is the mode identifier and is used to load a script file from the `modes` folder, in
the configuration directory, corresponding to that ID. So if you click the modeSelectors 'parallel' entry, the page refreshes and the `modes/parallel_mode.js` will be loaded.

The mode called `default` will always be loaded first. If there is no need for more than one mode, leave `settings.modeConfig` empty.

## Corpora
The config file contains the corpora declaration, wherein the available corpora are declared together with information about which metadata fields are searchable in them. Adding a test corpus is as simple as:


        settings.corpora = {};
        settings.corpora["testcorpus"] = {
            id: "testcorpus",
            title: "The Korp Test Corpus",
            description: "A test corpus for testing Korp.",
            within: {"sentence": "sentence"},
            attributes: {
                pos: {
                    label: "pos",
                    opts: {
                        "is": "=",
                        "is_not": "!="
                    }
                }
            },
            structAttributes: {
            }
        }

* `id`: Short form title, should correspond to the key name of the definition.
* `title`: Long form title, for display in the corpus chooser.
* `description`: For display in the corpus chooser.
* `within`: What are the structural elements of the corpus? See `defaultWithin` in [settings summary](#summary-settings) for format and more information.
* `attributes`: each key here refers to a word attribute in Corpus Workbench. Their values are JSON structures with a few attributes of their own; they are concerned with generating the necessary interface widgets in Extended Search, display in sidebar and statistics. They are:
    * `label`: a translation key for the attributes name
    * `limitedAccess`: `boolean`, it will not be possible to select this corpus unless a user is logged in and has the correct credentials.
    * `displayType`: set to `'hidden'` to fetch attribute, but never show it in the frontend. See `hideSidebar`, `hideStatistics`, `hideExtended` and `hideCompare` for more control.
    * `translationKey`: you can declare a prefix for the translation keys of the dataset here. This is so the corpora translation file doesn't get too messy: a simple kind of namespacing.
    * `extendedTemplate`: Angular template used in conjunction with the `extendedController` to generate an interface widget for this attribute. See <#ref customizing-extended-search|customizing extended search>.
    * `extendedController`: Angular controller that is applied to the template. See <#ref customizing-extended-search|customizing extended search>.
    * `opts`: this represents the auxiliary select box where you can modify the input value. See `defaultOptions` in [settings summary](#summary-settings) for format and more information.
    * `hideSidebar`: Default `false`. Hide attribute in sidebar.
    * `hideStatistics`: Default: `false`. Should it be possible to compile statistics based on this attribute?
    * `hideExtended`: Default: `false`. Should it be possible to search using this attribute in extended?
    * `hideCompare`: Default: `false`. Should it be possible to compare searches using this attribute?
    * `type`: Possible values:
        - "set" - The attribute is formatted as "|value1|value2|". Include contains and not contains in `opts`.
                  In the sidebar, the value will be split before formatted. When using compile / `groupby` on a "set" attribute in a statistics request, it will be added to `split`.
        - "url" - The value will be rendered as a link to the URL and possibly truncated if too long.
    * `pattern`: HTML snippet with placeholders for replacing values. Available is `key` (attribute name) and `value`. Also works for sets. Example: `'<p style="margin-left: 5px;"><%=val.toLowerCase()%></p>'`
    * `display`: How to display attribute in sidebar. Currently only supported for sets and `expandList` (see below). In the future more ways to display might be added here. 
        * `expandList`: Render set as a list where the first element is visible and a button to show or hide the rest of the elements.
            * `splitValue`: Function to split up values if there are sets within the set. Example: `function(value) { return value.split(','); }`
            * `searchKey`: If `display.expandList.internalSearch` is set to `true`, links will be rendered to search for the value in Korp, using this key in the CQP-expression. 
                           Omit to use same key as attribute name.
            * `joinValues`: Interleave this string with all values on the row.
            * `stringify`: Optional override of outer `stringify`.
            * `linkAllValues`: Should the `internalSearch` be enabled for all values or only the first one in the set?
            * `internalSearch`: Alternative function to transform the attribute key and value to a CQP-expression. 
                              Example: `function(key,value) { '[' + key + '="' + val + '"]' }`
    * `sidebarComponent`: If the `display` key above doesn't do enough, you can write a custom interactive component using `sidebarComponent.template` (an Angularjs template string) and `sidebarComponent.controller` (an Angularjs controller function). Useful for having e.g. a modal window pop up, or for rendering a small video player in the sidebar, or for anything else that isn't simple text or a link. `$scope.model` holds the value, so assigning to this variable will change the current CQP expression. See the `complemgram` and `compwf` implementation at the [Korp SB Config](https://github.com/spraakbanken/korp-frontend-sb/blob/dev/app/modes/common.js). 
    * `internalSearch`: `boolean`. Should the value be displayed as a link to a new Korp search? Only works for sets. Searches for CQP-expression: `[<attrName> contains "<regescape(attrValue)>"]`
    * `externalSearch`: Link with placeholder for replacing value. Example `https://spraakbanken.gu.se/karp/#?search=extended||and|sense|equals|<%= val %>`
    * `order`: Order of attribute in the sidebar. Attributes with a lower `order`-value will be placed over attributes with a higher `order`-value.
    * `stringify`: How to pretty-print the attribute in the context of the sidebar. Example: `function(str) { return util.lemgramToString(str, true); }`
    * `stats_stringify`: How to pretty-print the attribute in the context of the statistics table. The provided formatting function will be passed an array of labels. Example: `stats_stringify: function(values) {return values.join(" ")}`.
    * `stats_cqp`: How to create a cqp query when clicking a value in the statistics table. The provided formatting function will be passed an array of labels. Example: ```stats_cqp: function(values) {return `pos_tag="${tokens.join(" | ")}"`}```.  
    * `isStructAttr`: `boolean`. If `true` the attribute will be treated as a structural attribute in all sense except it will be included in the `show` query parameter instead of `show_struct` for KWIC requests. Useful for structural attributes that extend to smaller portions of the text, such as name tagging.
    * optional keys and values that can be utilized in the extendedTemplate / extendedController. See <#ref customizing-extended-search|customizing extended search>.

* `structAttributes`: refers to higher level metadata attributes. Examples include author, publishing year, URL etc. Structural attributes support the same settings as the word attributes.

* `customAttributes`: creates fields in the sidebar that have no corresponding attribute in the backend. Useful for combining two different attributes. All settings concerning sidebar format for normal attributes apply in addition to:
    * `customType`: `"struct"` / `"pos"` - decides if the attribute should be grouped under word attributes or text attributes.
    * `pattern`: Same as pattern for normal attributes, but `struct_attrs` and `pos_attrs` also available. Example: `'<p style="margin-left: 5px;"><%=struct_attrs.text_title - struct_attrs.text_description%></p>'`
* `readingMode`: If set, enables reading mode/text view for the 
   corpora. A link will appear in the sidebar and if clicked a new tab
   containg the text will be opened. This depends on your corpus having a
   structural attribute identifying the line in the KWIC (such as `sentence_id`
  , this may be configured with `settings.readingModeField`)
  and also a `_head` and `_tail` attribute, containing
  the whitespace before and after a token. The value can be set to:
  ```
  readingMode: {
        directive: "standard-reading-mode"
    }
  ```
  for basic support. If something else is needed you can write your own directive
  in `scripts/` and use that one instead. Contact Språkbanken for an example on
  how to write a directive.

## Customizing extended search

It is possible to customize the standard input field of extended search into anything. Any key can be added to an attribute to be provided to the `extendedController` / `extendedTemplate`. Simple example:


    var myReusableTemplate = '<div><input ng-if="inputType == \'text\'" type="text"><input ng-if="inputType == \'number\'" type="number"></div>';

    var myController = function($scope, $location) {
        // $scope.inputType is available here also
        // dependency injection of Angular services such as $location are possible
    };

    settings.corpora["testcorpus"] = {
        id: "testcorpus",
        title: "The Korp Test Corpus",
        description: "A test corpus for testing Korp.",
        attributes: {
            myAttr: {
                label: "myAttr",
                extendedTemplate: myReusableTemplate,
                extendedController: myController,
                inputType: "text"
            }
        }
    };

However, `extendedController` is not mandatory and only shown in this example for documentation purposes.

### Template requisites

In order for your template to work, it must set its value in `scope.model`, for example by using `ng-model="model"` for input-fields.

### autoc

A directive that autocompletes word forms to lemgrams or senses using Karp. Used in the following way:

    <autoc placeholder="placeholder" type="lemgram" model="model"
     disable-lemgram-autocomplete="disableLemgramAutocomplete"
      text-in-field="textInField">

Where `type` may be either `lemgram` or `sense`. `model` will be the selected lemgram / sense. `textInField` will be actual user input
(user did not select anything). Placeholder will contain the pretty-printed lemgram / sense. It is also possible to make the element fall back to a "normal"
text field by setting `disableLemgramAutocomplete` to `false`.

### escaper

`escaper` is a directive that takes the user's input and escapes any regexp characters before saving it to `scope.model`. 
When the model changes it automatically de-escapes any regexp characters before showing the value to the user. Input must be saved to `scope.input` for it to work. Example: `<input ng-model="input" escaper>`

## Parallel Corpora

Parallel corpora need to have its own mode. Use `modes/parallel_mode.js`, but replace the corpus definitions. Change the line `var start_lang = "swe";` to whatever language that should be the default search language.

The corpora declaration for parallel corpora is different in some important ways. Example:

~~~~~~~
settings.corpora["saltnld-sv"] = {
    id: "saltnld-sv",
    lang: "swe",
    linkedTo: ["saltnld-nl"],
    title: "SALT svenska-nederländska",
    context: context.defaultAligned,
    within: {
    	"link": "meningspar"
    },
    attributes: {},
    structAttributes: {}
};
~~~~~~~
~~~~~~~
settings.corpora["saltnld-nl"] = {
    id: "saltnld-nl",
    lang: "nld",
    linkedTo: ["saltnld-sv"],
    title: "SALT svenska-nederländska",
    context: context.defaultAligned,
    within: {
    	"link": "meningspar"
    },
    attributes: {},
    structAttributes: {},
    hide: true
};
~~~~~~~

The corpus configuration for parallel corpora needs to make explicit the links between the declared corpora. This is done using the `linkedTo` property. A corpus may declare any amount of links to other corpora. Also notice the `lang` property, used for building the correct language select menu. The `within` attribute should use the `"link": "meningspar"` value. Also note the `hide` attribute which prevents both subcorpora from being listed in the corpus chooser widget.

## Rendering attribute values in the statistics-view
The appearance of the leftmost columns of hits in the stats table can be controlled by editing `app/config/statistics_config.js`. These change according to the 'compile based on' select menu and might need a different stringification method depending on the chosen attribute. Make sure the function returns valid html. A known issue is that annotations containing spaces when searching for more than one token works less than perfect.

## Autocompletion menu

Korp features an autocompletion list for searches in the Simple Search as well as in Extended for those corpus attributes configured to use `autoc`-directive (see <#ref autoc|autoc-section>). This is implemented using an Angular.js directive `autoc` that calls Karp's autocompletion function. Using Karp, Korp can autocomplete senses and lemgrams. To disable autocompletion  in simple search use `settings.autocomplete = false`.

## Word picture

The word picture-config object looks like this:

    setting.wordPictureConf = {
        pos_tag: [table_def1, tabledef2...]
    }

where `table_def` is an array of objects that describe the resulting word picture table. `table_def1` above might look like this:

    [
        {rel: "subject", css_class: "color_blue"},
        "_",
        {rel: "object", css_class: "color_purple"},
        {rel: "adverbial", css_class: "color_purple", field_reverse: false}
    ]

The `"_"` refers to the placement of the hit in the table order. The value for `rel` refers to a key in `settings.wordpictureTagset` looking like this:

    settings.wordpictureTagset = {
        // the actual value for the pos-tag must be given in this object
        pos_tag: "vb",  

        subject: "ss",
        object: "obj",
        adverbial: "adv"
    }

The values are the actual relations returned by the backend. The relation used is determined by `field_reverse`. If `field_reverse` is `false` (default), `dep` is used, else `head`. If you find yourself with a table full of the search word just flip the `field_reverse` switch.

`css_class` simply gives a class to the column, useful for applying background color. The last supported attribute is `alt_label`, used for when another value than the relation name should be used for the table header.

## Map

Korp's map uses annotations to get locations. The user selects rows from the statistics table and points derived from different rows will have different colors. The selected corpora must have structural attributes with location data in them. The format is `Fukuoka;JP;33.6;130.41667` - the location name, the country, latitude and longitude separated by `;`.

    Also the name of the attribute must contain `"__"` and `"geo"` to show up in the list of supported attributes.

__settings.newMapEnabled__ - `boolean`. The map should be enabled. The weird name is because another map existed before, but has been remove. The name will change in upcoming releases.
__settings.mapCenter__ - Where the center of the map should be located when user opens map. Example:  

    settings.mapCenter = {
      lat: 62.99515845212052,
      lng: 16.69921875,
      zoom: 4
    };


## News widget

By setting a `newsDeskUrl` on settings, the news widget is enabled. The widget simply fetches a json-file from the given URL. Short example of such a file, including only one news item with its title and body in two languages and a date:

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

## <a name="summary-settings">Summary of settings</a>

Settings are required unless specified to be optional.

__autocomplete__ - Boolean. Enable autocomplete (see **autoc**-directive) for simple search.

__languages__ - Array of supported interface language codes s.a. `["en", "sv"]`

__defaultLanguage__ - The default interface language. Example: `"sv"`

__downloadFormats__ - Available formats of KWIC-download. See supplied `config.js`.

__downloadFormatParams__ - Settings for KWIC-download. See supplied `config.js`.

__wordAttributeSelector__ - `"union"` / `"intersection"`. Controls attribute list in extended search. Use all selected corpora *word* attributes or only the attributes common to selected corpora.

__structAttributeSelector__ - Same as __wordAttributeSelector__, but for structural attributes.

__reduceWordAttributeSelector__ - Same as __wordAttributeSelector__, but for the "compile based on"-configuration in statistics. Warning: if set to `"union"`, the statistics call will fail if user selects an attribute that is not supported by a selected corpus.

__reduceStructAttribute_selector__ - Same as __reduceWordAttributeSelector__, but for structural attributes.

__newsDeskUrl__ - See **News widget**. Optional.

__wordpictureTagset__ - See **Word picture**

__wordPictureConf__ - See **Word picture**

__visibleModes__ - See **Adding modes**

__modeConfig__ - See **Adding modes**

__primaryColor__  - Background color in corpus chooser, CSS color. Example: `"rgb(221, 233, 255)"`

__primaryLight__  - Background color of settings area, CSS color. Example: `"rgb(221, 233, 255)"`

__defaultOverviewContext__ - The default context for KWIC-view. Use a context that is supported by the majority of corpora in the mode (URLs will be shorter). E.g.: `"1 sentence"`. For corpora that do not support this context an additional parameter will be sent to the backend based on the `context`-setting in the corpus.

__defaultReadingContext__ - Same as __defaultOverviewContext__, but for the context-view. Use a context larger than the __defaultOverviewContext__.

__defaultWithin__ - An object containing the structural elements of a corpus. Default within is used unless a corpus overrides the setting using `within`. Example:

    settings.defaultWithin = {
        "sentence": "sentence",
        "paragraph": "paragraph"
    };

In simple search, we will search within the default context and supply extra information for the corpora that do not support the default context.

In extended search, the default `within` will be used unless the user specifies something else. In that case the user's choice will be used for all corpora that support it and for corpora that do not support it, a supported `within` will be used.

__cqpPrio__ - An array of attributes to order and-clauses in CQP-expressions by. Order the array by how specific an attribute is in increasing order. `word` will probably be the most specific attribute and should be placed last, while POS-tags will be near the beginning. A well ordered list will speed up queries significantly.

__defaultOptions__ - Object containing the default operators for extended search. May be overridden for each attribute by setting `opts` on the attribute-configuration. The object keys are translation keys and values are the frontend's internal representation of CQP. Example:

    settings.defaultOptions = {
        "is": "=",
        "is_not": "!=",
        "starts_with": "^=",
        "contains": "_=",
        "ends_with": "&=",
        "matches": "*=",
        "matches_not": "!*=",
    }

Explanation of internal format:

             Internal representation       CQP                     Note
----         -------                       ---                     ----
starts with  `[key ^= "val"]`              `[key = "val.*"]`
contains     `[key _= "val"]`              `[key = ".*val.*"]`
ends with    `[key &= "val"]`              `[key = ".*val"]`
matches      `[key *= "val"]`              `[key = "val"]`         Used with `escaper`-directive, regexp
matches not  `[key !*= "val"]`             `[key != "val"]`        special characters will not be escaped.

**TODO: move these explanations to a better place** Then we have the five last operators again, but using `contains` instead of `=`:

             Internal representation            CQP                         Note
----         -------                            ---                         ----
starts with  `[key starts_with_contains "val"]` `[key contains "val.*"]`
contains     `[key incontains_contains "val"]`  `[key contains ".*val.*"]`  Strange name due to CQPParser getting confused by `contains_contains`
ends with    `[key ends_with_contains "val"]`   `[key contains ".*val"]`
matches      `[key regexp_contains "val"]`      `[key contains "val"]`      Used with `escaper`-directive, regexp
matches not  `[key not_regexp_contains "val"]`  `[key not contains "val"]`  special characters will not be escaped.

__cgiScript__ - URL to Korp CGI-script

__downloadCgiScript__ - URL to Korp download CGI-script

__wordpicture__ - Boolean. Enable word picture.

__statisticsCaseInsensitiveDefault__ - Boolean. Selects case-insensitive for "compile based on" by default.

__inputCaseInsensitiveDefault__ - Boolean. Selects case-insensitive for simple search by default.

__corpora__ - See **Corpora**

__corpusListing__ - After specifying all corpora in a modes-file use:
`settings.corpusListing = new CorpusListing(settings.corpora);` to enable the configuration. For parallel corpora use: `settings.corpusListing = new ParallelCorpusListing(settings.corpora, parseLocationLangs());`

__corporafolders__ - Create a directory-structure in corpus chooser. Example:

    settings.corporafolders.foldername = {
        title: "A folder",
        contents: ["corpus1", "corpus2"],
        description: "Optional description"
    };

    settings.corporafolders.foldername.subfolder = {
        title: "A sub folder",
        contents: ["corpus3", "corpus4"]
    }

__preselectedCorpora__ - An array of corpus (internal) names or folder names. Given corpora and corpora in folders will be selected on load. To select only a subfolder write `folder.subfolder`.
 
__newMapEnabled__ - See **Map**.

__mapCenter__ - See **Map**.

__hitsPerPageValues__ - An array of possible number of hits per page for example: `[25,50,75,100]`

__hitsPerPageDefault__ - The number of hits per page that Korp should select by default. If emitted, fallback value is the first element in `hitsPerPageValues`

# Developing the Korp Frontend

Here is where we present details on how to install development dependencies for the Korp frontend and how to build and distribute the frontend code.

## Source code

The source code is available on [Github][github-frontend].

## Setting up the development environment

The Korp frontend uses a plethora of technologies and has a corresponding amount of dependencies. Luckily, a set of package managers do all the heavy lifting and so you should be up and running in no time. Simply follow these steps:

* Install Yarn
* Fetch the latest Korp source release.
* `cd` to the Korp folder you just checked out and run `yarn` in order to fetch the local dependencies. This includes libs for compiling transpiling javascript, building, running a dev server, as well as the required client side javascript libs utilized directly by Korp.

You are now ready to start the dev server, do so by running `yarn dev`. In you browser, open `http://localhost:9111` to launch Korp. Now, as you edit the Korp code, javascript and Sass files are automatically compiled/transpiled as required, additionally causing the browser window to be reloaded to reflect the new changes.

## Localization

Korp does runtime DOM manipulation when the user changes language. Using an Angular filter to specify which translation key looks like this:

    <div>{{'my_key' | loc}}</div>

[Deprecation warning] Before the Angular approach we used the `rel` attribute, like so (but you shouldn't any more):
  `<span rel="localize[translation_key]">...</span>`

## Map

Modify the map with configuration, `scripts/map_controllers.coffee` or the Geokorp-component located in `components/geokorp`. Geokorp wraps [Leaflet][leaflet] and adds further functionality such as integration with Angular, marker clustering, marker styling and information when selecting a marker. 

## Building a distribution

Building a distribution is as simple as running the command `yarn build`. A `dist` folder is created. These are the files to use for production deployment. The build system performs concatenation and minimization of JavaScript and CSS source files, giving the resulting code a lighter footprint.

[MIT]: https://opensource.org/licenses/MIT
[angular-i18n]: https://github.com/angular/bower-angular-i18n
[leaflet]: http://leafletjs.com/
[github-frontend]: https://github.com/spraakbanken/korp-frontend/
