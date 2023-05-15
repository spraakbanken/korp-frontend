# Changelog

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
