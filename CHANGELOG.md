# Changelog

## [Unreleased]

### Removed

- Map layer "Stamen Watercolor" [#339](https://github.com/spraakbanken/korp-frontend/issues/339)

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
[9.5.3]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.5.3
[9.5.2]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.5.2
[9.5.1]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.5.1
[9.5.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.5.0
[9.4.4]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.4
[9.4.3]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.3
[9.4.2]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.2
[9.4.1]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.1
[9.4.0]: https://github.com/spraakbanken/korp-frontend/releases/tag/v9.4.0
