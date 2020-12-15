webpackConfig = require('../../webpack.common.js')
webpackConfig.mode = 'development'
webpackConfig.entry = {
  bundle: './test/karma/index.js'
}

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '../../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to exclude
    exclude: [],
    client: {
      captureConsole: true
    },
    // web server port
    port: 8080,
    reporters: ['progress'],
    colors: true,
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,
    files: [
      { pattern: 'test/karma/spec/*.js', watched: false }
    ],
    preprocessors: {
      'test/karma/spec/*.js': [ 'webpack' ]
    },
    webpack: webpackConfig,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    browsers: ['ChromeHeadless'],
    concurrency: Infinity,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
}
