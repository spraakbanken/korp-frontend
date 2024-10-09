# Changelog

## [Unreleased]

### Added

- Support `.env`
- Simplify time interval CQP covering whole days [#379](https://github.com/spraakbanken/korp-frontend/issues/379)

### Changed

- Font is now a dependency, not checked-in files (and the font looks slightly different)
- New loading spinners in result tabs

### Fixed

- In the corpus selector, an empty folder would add 1 to the parent folder's corpus count
- Searching by pressing Enter in Simple search is broken [#394](https://github.com/spraakbanken/korp-frontend/issues/394)
- Barcode (aka hitsPicture) sometimes missing from KWIC tab [#395](https://github.com/spraakbanken/korp-frontend/issues/395)
- Error when loading with restricted corpora selected [#398](https://github.com/spraakbanken/korp-frontend/issues/398)

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

## [9.5.0] - 2023-01-22

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
