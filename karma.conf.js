// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],


    // files = [
    //   JASMINE,
    //   JASMINE_ADAPTER,
    //   'app/components/angular/angular.js',
    //   'app/components/angular-mocks/angular-mocks.js',
    //   // 'app/components/jquery/jquery.js',
    //   // 'app/scripts/*.js',
    //   // 'app/scripts/**/*.js',
    //   'test/mock/**/*.js',
    //   'app/components/lodash/lodash.js',
    //   'app/config.js',
    //   'app/scripts/bin/util_coffee.js',
    //   'test/spec/**/*.js'
    // ];
    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/components/lodash/lodash.js',
      'app/config.js',
      'app/scripts/bin/util.js',
      'app/scripts/cqp_parser/CQPParser.js',
      'app/scripts/bin/cqp_parser/cqp.js',
      // 'app/scripts/*.coffee',
      // 'app/scripts/**/*.coffee',
      'test/mock/**/*.js',
      'test/spec/**/*.js'

    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
}