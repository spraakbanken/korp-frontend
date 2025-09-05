# Changelog

## [Unreleased]

### Added

- Make "dependency tree" link more visible in the sidebar [#451](https://github.com/spraakbanken/korp-frontend/issues/451)
- Use [peggy-loader](https://github.com/RocketChat/fuselage/tree/main/packages/peggy-loader) to compile CQP parser at build time
- Login form help text
- Experimental support for right-to-left (rtl) corpus text
- Word picture works with any search mode as long as it is a single word or lemgram
- Improved error illustration

### Changed

- A big effort to separate "core" code (types/interfaces and data processing) from "UI" code (components, other AngularJS usage). Notably:
  - Moved data processing related to dynamic result tabs into corresponding classes: `CompareTask`, `ExampleTask`, `MapTask`, `TextTask`, `TrendTask`, `WordpicExampleTask`
  - Added `ProxyBase` abstract class to streamline proxy classes
    - Renamed `prevParams` to `params`
    - Removed `prevUrl` and `prevCQP`
  - Moved SALDO and lemgram parsing/prettifying from util to their own classes
  - Moved AngularJS-specific utils from `@/util` to `@/angular-util`
  - Dropped the `RootScope` arg from `settings["initialization_checks"]` – use `getService()` if needed
  - Converted `compareSearches` service to non-AngularJS-dependent `savedSearches`
  - Converted `globalFilterService` service to non-AngularJS-dependent `GlobalFilterManager`
  - In `CorpusListing`:
    - Merged `getContextQueryString` and `getContextQueryStringFromCorpusId` as `getContextParams`
    - Split `getAttributeGroups`/`getStatsAttributeGroups` into `getAttributeGroups`, `getAttributeGroupsCompare`, `getAttributeGroupsExtended` and `getAttributeGroupsStatistics`
- Changes to reduce circular dependencies, notably:
  - Removed `settings.corpusListing`; use `import { corpusListing } from "@/corpora/corpus_listing"` instead
  - Auth modules are `AuthModule` objects, not just a group of functions
    - Import `{ auth }` instead of `* as authenticationProxy`
  - Moved `valfilter` in `@/util` to `prefixAttr` in `@/settings`
  - Moved locale-related functions from `@/util` to `@/i18n/util`
- Moved many source files into new subdirectories
- Moved non-component auth-related files out of `@/components` directory
- The `searches` service is removed in favor of the store:
  - Write to `store.activeSearch` to commit a new main search query, result tabs watch it
  - Search tabs watch `store.search` and `store.cqp` to restore a search from init/frontpage/history
- The JSON button is a regular button, not an image, and downloads the stored, actual response instead of sending a new request
- Stats/trend CSV export uses central abs/rel switch, not its own select
- In extended search, the query is stored in URL only when searching, not dynamically while editing
- Search history is broken in parallel mode, and is disabled for now
- Removed old jStorage conversion
- In the KWIC sidebar, labels are bold and values are indented

### Fixed

- Improve statistics download [#154](https://github.com/spraakbanken/korp-frontend/issues/154)
- Statistics grid error if attribute value contains HTML [#472](https://github.com/spraakbanken/korp-frontend/issues/472)
- Map examples empty if query uses repetition [#475](https://github.com/spraakbanken/korp-frontend/issues/475)
- Dependency tree: label missing on hover [#441](https://github.com/spraakbanken/korp-frontend/issues/441)
- Protected corpora are deselected before logging in [#476](https://github.com/spraakbanken/korp-frontend/issues/476)
- Prevent empty "Group by" selector when changing corpus
- Prevent relative frequency "NaN" when loading first KWIC result
- Related words heading link url
- Use `angular.toJson` in `localStorageGet` to avoid storing `$$hashKey` etc.
- Stray value when clearing simple search input
- Prevent switching trend diagram form before done loading
- Extended search query is propertly restored when activating a search history item
- All files except `app/lib/` are now formatted by Prettier, removed `@format` comments

## [9.10.1] - 2025-07-02

### Fixed

- Links with stats_reduce with missing attribute crashes [#314](https://github.com/spraakbanken/korp-frontend/issues/314)
- Federated authentication module: require READ, not WRITE [#461](https://github.com/spraakbanken/korp-frontend/issues/461)
- First click on the "Group by" dropdown triggers a re-fetch [#467](https://github.com/spraakbanken/korp-frontend/issues/467)
- Switching to Statistics tab always fetches new results [#468](https://github.com/spraakbanken/korp-frontend/issues/468)
- Case-insensitive statistics generates bad CQP for example [#469](https://github.com/spraakbanken/korp-frontend/issues/469)

## [9.10.0] - 2025-06-26

### Added

- KWIC: Show number of hits as relative frequency [#456](https://github.com/spraakbanken/korp-frontend/issues/456)
- Background color for statistics totals column
- Configurable limit for statistics API call (alternative to [#73](https://github.com/spraakbanken/korp-frontend/issues/73) and [#92](https://github.com/spraakbanken/korp-frontend/issues/92))
- Statistics: choose between absolute or relative frequencies [#454](https://github.com/spraakbanken/korp-frontend/issues/454)
- Specify site-specific logos in configuration [#325](https://github.com/spraakbanken/korp-frontend/issues/325)

### Changed

- A `store` service was introduced to consolidate state management
  - Most Root Scope properties have moved to it: `activeSearch`, `extendedCQP`, `globalFilterData`, `globalFilter`, `lang`, `simpleCQP`, `show_modal` (now `display`), `statsRelative`
  - Most other app state properties that were synced to URL parameters have also moved to it: `corpus`, `cqp`, `cqp_<lang>` (as `cqpParallel`), `global_filter`, `hpp`, `isCaseInsensitive`, `mid_comp`, `in_order`, `page`, `parallel_corpora`, `prefix`, `random_seed`, `reading_mode`, `search`, `sort`, `stats_reduce`, `stats_reduce_insensitive`, `suffix`, `within`
  - The `corpuschooserchange` and `initialcorpuschooserchange` events are replaced with `store.watch("corpus", ...)`
  - The store internally uses `$rootScope`, so there's a lot of `$root` usage remaining in HTML templates
  - `globalFilterDef`, `langDef` and `getActiveCqp()` were removed because they are no longer needed
  - `loc_data` was extracted to `@/loc-data.ts` (use its `getLocData()` or `locData`)
  - In `CorpusListing`, `getWithinParameters()` now takes the app-wide value as input and returns only the corpus-specific value.
- The `escaper` directive has been removed; escaping is applied automatically

### Fixed

- Decimal separator not updated in statistics when changing language [#246](https://github.com/spraakbanken/korp-frontend/issues/246)
- Empty value "∅" in stats table not clickable [#457](https://github.com/spraakbanken/korp-frontend/issues/457)
- Update progress indicator when aborting search
- Prevent bad timespan request if no corpora are available

## [9.9.1] - 2025-04-14

### Fixed

- Statistics grouped rows: sub CQP only has one of the values [#452](https://github.com/spraakbanken/korp-frontend/issues/452)
- Statistics CSV/TSV export broken when grouping by multiple attributes [#458](https://github.com/spraakbanken/korp-frontend/issues/458)
- Use attribute value without colon-suffix in stats export [#459](https://github.com/spraakbanken/korp-frontend/issues/459)

## [9.9.0] - 2025-03-24

### Added

- Choose to show word picture by frequency or LMI [#433](https://github.com/spraakbanken/korp-frontend/issues/433)
- Word picture help texts

### Changed

- Display options in Simple search as a form [#357](https://github.com/spraakbanken/korp-frontend/issues/357)
- Load corpus timespan data in parallel when loading app [#437](https://github.com/spraakbanken/korp-frontend/issues/437)
  - Instead of `settings.time_data`, use `import { timeData } from "./timedata"`
  - Await `getTimeData()` before using `timeData` or `corpus.time`/`corpus.non_time`. The function is memoized, so repeated calls will not affect performance
- Load Statistics and Word picture result when the tab is selected [#442](https://github.com/spraakbanken/korp-frontend/issues/442)
- The "medial part" search option is logically linked to initial and final part [#443](https://github.com/spraakbanken/korp-frontend/issues/443)
- The display options (hits per page, sort within corpora, compile based on) were moved into the KWIC and Statistics tab correspondingly
  - When these are changed, the search is re-triggered automatically
  - The "compile based on" input was relabeled as "group by"
- The "word" group-by option no longer gets disabled if it's the only selected option
- Moved "Show context" option to the new display options location and changed to checkbox
- Better readability for hit counts in lemgram autocomplete
- More space in word picture tables [#102](https://github.com/spraakbanken/korp-frontend/issues/102)

### Fixed

- Selecting a search history item used to reset params that were not part of the search
- Trend diagram legend missing
- Internal search links in sidebar does not activate relevant search/result tabs [#450](https://github.com/spraakbanken/korp-frontend/issues/450)
- Comparison result not showing if a search is not done first [#413](https://github.com/spraakbanken/korp-frontend/issues/413)
- Extended search: do not cache operator options across corpora [#409](https://github.com/spraakbanken/korp-frontend/issues/409)
- Error when logging out while protected corpora are selected [#440](https://github.com/spraakbanken/korp-frontend/issues/440)
- Error when loading with restricted corpora selected and then dismissing login dialog [#399](https://github.com/spraakbanken/korp-frontend/issues/399)
- Cached translation files cause broken UI after releases [#435](https://github.com/spraakbanken/korp-frontend/issues/435)

## [9.8.5] - 2025-03-17

### Fixed

- Error when switching corpora with filters: slow response from /attr_values does not match new selection [#446](https://github.com/spraakbanken/korp-frontend/issues/446)
- Error when searching for multiple tokens and grouping by text attribute [#447](https://github.com/spraakbanken/korp-frontend/issues/447)

## [9.8.4] - 2025-02-20

### Fixed

- Error when opening corpus chooser in mode with no corpus time data [#434](https://github.com/spraakbanken/korp-frontend/issues/434)

## [9.8.3] - 2025-02-17

### Fixed

- Filter constraints are added to CQP when searching in advanced [#193](https://github.com/spraakbanken/korp-frontend/issues/193)
- Remove language suffix in parallel corpus info link [#424](https://github.com/spraakbanken/korp-frontend/issues/424)
- Focus newly created tab [#430](https://github.com/spraakbanken/korp-frontend/issues/430)
- Translations for "pos\_\*" not found [#352](https://github.com/spraakbanken/korp-frontend/issues/352)

## [9.8.2] - 2025-01-27

### Changed

- Removed `$rootScope.searchtabs()`, use `$location.search()` to get/set `search_tab` instead
- Removed `$rootScope._settings`, use `import settings from "@/settings"` instead
- Removed `$rootScope.openErrorModal()`, use `$uibModal` directly instead
- Result tab progress bars grow smoothly and are shown even when only one corpus is selected
- Removed old test code

### Fixed

- Deselect unavailable global filter values after changing corpus selection
- Error when loading a non-`visible_modes` mode [#426](https://github.com/spraakbanken/korp-frontend/issues/426)

## [9.8.1] - 2025-01-23

### Fixed

- Assignment typo in if condition causes error when aborting statistics request [#425](https://github.com/spraakbanken/korp-frontend/issues/425)
- Simple search options were not properly synced from URL params

## [9.8.0] - 2025-01-20

### Added

- Sidebar: Collapse and expand attribute sections [#199](https://github.com/spraakbanken/korp-frontend/issues/199)
- Error messages from backend show up in the GUI [#97](https://github.com/spraakbanken/korp-frontend/issues/97)
- Catch unhandled errors and show in dialog [#419](https://github.com/spraakbanken/korp-frontend/issues/419)
- Save searches from extended mode [#118](https://github.com/spraakbanken/korp-frontend/issues/118)

### Changed

- The `corpus_config_url` setting is replaced by `get_corpus_ids`, see [doc/frontend_devel.md](./doc/frontend_devel.md)
- The `structService` service is replaced by non-AngularJS async functions in `@/backend/attr-values`
- The `lexicons` service is replaced by non-AngularJS async functions in `@/backend/lexicons`
- Util function `httpConfAddMethodFetch` was renamed to `selectHttpMethod`
- Util functions `httpConfAddMethod` and `httpConfAddMethodAngular` were removed
- Utilities for `JQuery.ajax` usage are removed (`.progress` handler, `AjaxSettings` type)
- The members of the `ProgressReport` type returned by `calcProgress()` have been renamed from `{struct, stats, total_results}` to `{data, percent, hits}`
- The `makeRequest` methods of the `*Proxy` classes now return native `Promise`

### Fixed

- No map for advanced CQP expressions that CQPParser does not recognize [#212](https://github.com/spraakbanken/korp-frontend/issues/212)
- Missing lemgrams in autocomplete [#416](https://github.com/spraakbanken/korp-frontend/issues/416)
- The response JSON download button now handles POST and logged-in requests, and has been moved into each corresponding result tab [#417](https://github.com/spraakbanken/korp-frontend/issues/417)
- Limit search history selector width [#415](https://github.com/spraakbanken/korp-frontend/issues/415)
- Search not triggered when choosing simple lemgram search from search history [#152](https://github.com/spraakbanken/korp-frontend/issues/152)

## [9.7.2] - 2024-12-09

### Added

- Support `.env`
- Simplify time interval CQP covering whole days [#379](https://github.com/spraakbanken/korp-frontend/issues/379)
- Track some events with Matomo: search, language switch
- Select button in Corpus Updates section [#367](https://github.com/spraakbanken/korp-frontend/issues/367)
- KWICs opened from the statistics should only query relevant corpora [#89](https://github.com/spraakbanken/korp-frontend/issues/89)
- Alphabetic sorting of statistics columns [#37](https://github.com/spraakbanken/korp-frontend/issues/37)

### Changed

- Font is now a dependency, not checked-in files (and the font looks slightly different)
- New loading spinners in result tabs
- Undo override of Tailwind classname separator for Pug [#376](https://github.com/spraakbanken/korp-frontend/issues/376)
- Extracted Karp backend usage into `app/scripts/karp.ts`
- `stringifyFunc(key)` was renamed to `getStringifier(key)`
- `stringify(key, x)` was removed, use `getStringifier(key)(x)` instead
- `getStructValues()` of `structService` is refactored into two different functions, matching the two present use-cases:
  - `getAttrValues()` for getting a flat list without counts
  - `countAttrValues()` for getting a deep structure with counts
- Search history is stored as parameters only, not full urls #118
- Enabled the `noImplicitAny` TypeScript flag for added strictness, and fixed/refactored various parts as a consequence
- The `hitCountHtml` util function now takes the numbers as a tuple
- `reduceStringify()` now returns the stringifier, so it can be called only once per attribute

### Fixed

- In the corpus selector, an empty folder would add 1 to the parent folder's corpus count
- Linking to corpus subfolder [#397](https://github.com/spraakbanken/korp-frontend/issues/397)
- Searching by pressing Enter in Simple search is broken [#394](https://github.com/spraakbanken/korp-frontend/issues/394)
- Barcode (aka hitsPicture) sometimes missing from KWIC tab [#395](https://github.com/spraakbanken/korp-frontend/issues/395)
- Error when loading with restricted corpora selected [#398](https://github.com/spraakbanken/korp-frontend/issues/398)
- Related words lookup must use OR [#401](https://github.com/spraakbanken/korp-frontend/issues/401)
- Add support for annotations of the type 'set' in attribute filters [#116](https://github.com/spraakbanken/korp-frontend/issues/116)
- Parallel mode is consistently checked against the `parallel` config setting, and not the mode name
- Search history fails to select corpus [#405](https://github.com/spraakbanken/korp-frontend/issues/405)
- Search history fails to distinguish options with same label [#406](https://github.com/spraakbanken/korp-frontend/issues/406)
- The "X of Y corpora selected" phrase is not properly translated [#408](https://github.com/spraakbanken/korp-frontend/issues/408)
- Empty localization strings sometimes render as localization key [#410](https://github.com/spraakbanken/korp-frontend/issues/410)
- Wider filter lists [#412](https://github.com/spraakbanken/korp-frontend/issues/412)
- Show intersection in attributes instead of union in comparison view [#56](https://github.com/spraakbanken/korp-frontend/issues/56)
- Alphabetic sorting of statistics rows

## [9.7.1] - 2024-09-18

### Fixed

- Read default settings before using them (for instance, `backendURLMaxLength` is used in calls to `/corpus_info` etc)

## [9.7.0] - 2024-09-17

### Added

- TypeScript typings for:
  - config/settings
  - URL parameters
  - CQP queries
  - CorpusListing
  - `$rootScope`
  - Auth module
  - services (`backend`, `compare-searches`, `lexicons`, `searches`, `utils`)
- Map code from `korp-geo` has moved into this codebase [#359](https://github.com/spraakbanken/korp-frontend/issues/359)

### Changed

- Replaced Raphael library with Chart.js, used in the pie chart over corpus distribution in statistics
- Replaced jStorage library with native `localStorage`, and added TypeScript typings
- In the `ParallelCorpusListing` class, the methods `getLinked` and `getEnabledByLang` have new parameter signatures
- Replaced custom `popper` directive with `uib-popover` and `uib-dropdown` ([docs](https://angular-ui.github.io/bootstrap/))
- Removed the `mapper` template filter; change `x | mapper:f` to `f(x)`
- Removed the global `c` alias for `console`
- Removed global `lang`, use `$rootScope["lang"]` instead (outside Angular: `getService("$rootScope")["lang"]`)
- Removed global `loc_data`, use `$rootScope["loc_data"]` instead (outside Angular: `getService("$rootScope")["loc_data"]`)
- Removed globals `CSV` and `moment`, import the libraries instead
- Converted the "radioList" JQuery widget to a component
- Using Karp 7 backend instead of Karp 4 [#388](https://github.com/spraakbanken/korp-frontend/pull/388)
- For the `utils.setupHash()` function, the `config` argument is no longer an array. To sync multiple parameters, call it once for each.
- Dopped support for old map usage (`sb-old-map="true"`)

### Fixed

- News were sometimes not shown immediately after fetch
- In the time interval component in Extended search:
  - Simple input fields were being ignored [#377](https://github.com/spraakbanken/korp-frontend/issues/377)
  - Handle end seconds correctly [#378](https://github.com/spraakbanken/korp-frontend/issues/378)
  - Parsing of the simple input had been incomplete since way back
- There was no word picture heading if lemgram
- Paging broken in word picture example search [#383](https://github.com/spraakbanken/korp-frontend/issues/383)
- Incoherent style change to corpus heading when switching between KWIC and context view [#389](https://github.com/spraakbanken/korp-frontend/issues/389)
- Context view broken in example search [#386](https://github.com/spraakbanken/korp-frontend/issues/386)
- Can't navigate between tokens in KWIC using arrow keys [#368](https://github.com/spraakbanken/korp-frontend/issues/368)

## [9.6.0] - 2024-05-27

### Added

- Frontpage with description, news, corpus updates and example search queries [#341](https://github.com/spraakbanken/korp-frontend/issues/341)
- Configurable generated link in corpus info [#355](https://github.com/spraakbanken/korp-frontend/issues/355)
- Loading spinner in the autocomplete for structural values (`structServiceAutocomplete`)

### Changed

- Newsdesk moved from icon+popup in header to frontpage [#348](https://github.com/spraakbanken/korp-frontend/issues/348)
- Switched to parsing news from YAML file, using new setting `news_url` instead of `news_desk_url` (see [docs/frontend_devel.md](frontend_devel.md)) [#348](https://github.com/spraakbanken/korp-frontend/issues/348)
- The "medial part" option now includes first/last parts also for lemgram search [#347](https://github.com/spraakbanken/korp-frontend/issues/347)
- Improved UI reactivity for Simple search
- Make the search button(s) more visible [#308](https://github.com/spraakbanken/korp-frontend/issues/308)
- Use native checkboxes in corpus chooser, not images [#362](https://github.com/spraakbanken/korp-frontend/issues/362)
- Replaced JQuery Flot library with Chart.js, used in corpus chooser time graph
- Added TypeScript definitions for Korp backend parameters and responses
- Wrapped `GraphProxy`, `KwicProxy`, `LemgramProxy`, `StatsProxy` and `TimeProxy` with factories; see [@/util/Factory](./app/scripts/util.ts)
  - Removed the `stats_rewrite` config option, as the change above eliminated the need for this
- Removed globals – import them instead (or their members):
  - `authenticationProxy`
  - `settings`
  - `currentMode`
  - `currentModeParallel`
  - `CQP`
  - `model`
  - `CorpusListing`
  - `ParallelCorpusListing`
  - `statisticsService`
  - `regescape`
  - `unregescape`
  - `safeApply`
- Removed the `warning` directive – use the `korp-warning` class directly instead.
- Removed the unused `toBody` directive
- Converted the `timeInterval` directive to a component `datetimePicker`
- Renamed localization functions (just like the template filters) and moved them to `@/i18n`:
  - `getLocaleString` to `loc`
  - `getLocaleStringObject` to `locObj`
  - `translateAttribute` to `locAttribute` (also moved the optional `lang` parameter last)
- Renamed lemgram/saldo functions:
  - `lemgramToString` to `lemgramToHtml`
  - `lemgramToPlainString` to `lemgramToString`
  - `isLemgramId` to `isLemgram`
  - `saldoToString` to `saldoToHtml`
  - `saldoToPlaceholderString` to `saldoToString`
- Removed `window.util` and converted its members to exported functions:
  - lemgram/saldo functions
  - `setDownloadLinks`
  - `httpConfAddMethod`, `httpConfAddMethodAngular`, `httpConfAddMethodFetch`
  - `collatorSort`
- Revised number formatting:
  - Removed `formatDecimalString` and `prettyNumbers`
  - Added `formatRelativeHits` to format a number with exactly one decimal
    - All occurrences of relative hit counts now use this
  - Added `hitCountHtml` to consistently format a relative+absolute tuple
- Revised the `locationSearch` and `searchHash` util functions:
  - Deprecated global `locationSearch` in favor of using `$location` directly
  - Removed global `searchHash` in favor of using `$location` directly
  - Added `locationSearchGet`/`locationSearchSet` to expose `$location.search` to code outside Angular
- Removed map layer "Stamen Watercolor" [#339](https://github.com/spraakbanken/korp-frontend/issues/339)
- Removed dependency `jquery.format`

### Fixed

- Statistics subquery incorrect when using repetition and boundaries [#354](https://github.com/spraakbanken/korp-frontend/issues/354)
- Correct order of numbers in trend diagram table (first relative, then absolute)
- Update number formatting in statistics table when switching language
- Disable Trend diagram and Map buttons while waiting for statistics search to finish [#346](https://github.com/spraakbanken/korp-frontend/issues/346)
- Error when clicking trend diagram with multiple series [#358](https://github.com/spraakbanken/korp-frontend/issues/358)
- Broken singleValue component [#361](https://github.com/spraakbanken/korp-frontend/issues/361)
- Strip HTML from total hits in annotated KWIC dowload
- Fix dynamic translation for tabs, filters etc
- Modes in "More" menu sorted locale-awarely
- Allow dash in attribute name
- Restore UI message when search gives no hits
- The `corpus_info` request uses `GET` when possible

## [9.5.3] - 2024-03-11

### Added

- Add content hash to bundle.js to fix caching [#318](https://github.com/spraakbanken/korp-frontend/issues/318)
- Add relative hits to map view [#52](https://github.com/spraakbanken/korp-frontend/issues/52)
- Allow static corpus config

### Changed

- Do not say "Results: 0" while loading
- Switch from PEG.js to its successor Peggy

### Fixed

- Unnecessarily complex query when combining initial/medial/final part [#235](https://github.com/spraakbanken/korp-frontend/issues/235)
- Disable "Show map" button if no location data is available [#238](https://github.com/spraakbanken/korp-frontend/issues/238)
- Drop console error when loading page without `cqp` param

### Removed

- Dependency `jquery-deparam`
- Dependency `jReject`

## [9.5.2] - 2024-02-21

### Added

- Basic visitor analytics with Matomo [#149](https://github.com/spraakbanken/korp-frontend/issues/149)

### Changed

- The "in order" option is inverted, so it is now "in free order" and unchecked by default (but still `in_order` in the URL query param and in the API)
- The checkbox of said option no longer gets disabled in Extended mode
- Replaced `NODE_ENV` with our own variable `ENVIRONMENT` to properly allow the `"staging"` value

### Fixed

- Parallel sentence alignment [#323](https://github.com/spraakbanken/korp-frontend/issues/323)
- Trend diagram subquery with repetition [#288](https://github.com/spraakbanken/korp-frontend/issues/288)
- Restore lab logo

### Removed

- Automatic disabling of the "Show statistics" checkbox

## [9.5.1] - 2024-02-12

### Changed

- Logos with taglines

### Fixed

- Improve UX for "in order" option [#335](https://github.com/spraakbanken/korp-frontend/issues/335)
- Unnecessary scrollbars in the corpus selector info panel [#333](https://github.com/spraakbanken/korp-frontend/issues/333)
- Bug with undefined `arguments`
- On repetition error (all tokens repeat from 0), restore red outline for input
- Use `<match>` to constraint CQP subqueries (from statistics rows etc)

## [9.5.0] - 2024-01-22

### Added

- A GitHub action to check the build
- Add support for "not in order" in extended and advanced search [#17](https://github.com/spraakbanken/korp-frontend/issues/17)
- The `stats_rewrite` setting for altering the statistics table

### Changed

- Logo changes: New Korp, new Språkbanken Text, replaced Swe-CLARIN with University of Gothenburg, new Karp icon [#329](https://github.com/spraakbanken/korp-frontend/issues/329)
- The search history selector has been moved down to the search tab bar

### Fixed

- Resolve folder name in corpus param [#13](https://github.com/spraakbanken/korp-frontend/issues/13)
- Long URLs in sidebar are always presented as http:// links [#330](https://github.com/spraakbanken/korp-frontend/issues/330)
- Enable newer ChromeDriver versions for testing [#331](https://github.com/spraakbanken/korp-frontend/issues/331)

## [9.4.4] - 20231031

### Bug fixes

- https://github.com/spraakbanken/korp-frontend/issues/326
- https://github.com/spraakbanken/korp-frontend/issues/328

## [9.4.3] - 20230531

### Bug fixes

- https://github.com/spraakbanken/korp-frontend/issues/323
- https://github.com/spraakbanken/korp-frontend/issues/327

## [9.4.2] - 20230515

### Bug fixes

- https://github.com/spraakbanken/korp-frontend/issues/322

## [9.4.1] - 20230427

### Changed

- Improvements for instances running the frontend without `run_config.json`
- Improved error handling

### Bug fixes

- https://github.com/spraakbanken/korp-frontend/issues/320

## [9.4.0] - 20230404

### Changed

- It is now possible to run the development server using HTTPS, see `README.md`.
- Authentication was refactored to make it possible to switch implementations.
- A new kind of authentication was added - "federated" authentication using redirection to login and JWT tokens.
- The initializaiton of the app was refactored, most of the work was moved to `app/scripts/data_init.js`.
- All dependencies (includeding development) was updated to the latest version. Notably, Webpack was upgraded to version 5.
- Huge refactor where the last remaining pieces of pug markup language was removed. Simultaneous conversion of old markup+controllers/directives
  Angular components.
- Babel was removed from the build process. We now rely on making sure not to use too new features by ourselves.
- Support for hiding labels in sidebar - `sidebar_hide_label`.
- User manual available in English.
- Modes may use a `description`-field to show some information in the blank space under the search alternatives.
- Escape backslashes when doing "regescaping".
- Generally lots of refactoring, mostly creating Angular.js components where possible.

### Notable bug fixes

- Most bug fixes was related to the refactoring breaking things
- Lots of bug fixes for the sidebar

[unreleased]: https://github.com/spraakbanken/korp-frontend/compare/master...dev
[9.10.1]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.10.1
[9.10.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.10.0
[9.9.1]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.9.1
[9.9.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.9.0
[9.8.5]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.8.5
[9.8.4]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.8.4
[9.8.3]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.8.3
[9.8.2]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.8.2
[9.8.1]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.8.1
[9.8.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.8.0
[9.7.2]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.7.2
[9.7.1]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.7.1
[9.7.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.7.0
[9.6.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.6.0
[9.5.3]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.5.3
[9.5.2]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.5.2
[9.5.1]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.5.1
[9.5.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.5.0
[9.4.4]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.4
[9.4.3]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.3
[9.4.2]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.2
[9.4.1]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.1
[9.4.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.0
