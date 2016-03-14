

// var HtmlReporter = require('protractor-html-screenshot-reporter');

exports.config = {

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
        'args': ['--disable-extensions'],
        prefs: {
            download: {
                prompt_for_download: false, 
                directory_upgrade: true,
                default_directory: 'test/e2e/bin'
            }
        }
    }
  },

  // Spec patterns are relative to the current working directly when protractor is called.
  specs: ['bin/*.js'],
  // specs: ['bin/parallel.js'],
          // 'bin/map.js',
          // 'bin/autocomplete.js',
          // 'bin/statistics.js',
          // 'bin/compare.js',
          // 'bin/statistics_export.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 10000
  },
  directConnect: true,
  restartBrowserBetweenTests: true

 //  onPrepare: function() {
 //    jasmine.getEnv().addReporter(new HtmlReporter({
 //       baseDirectory: 'test/reports',
 //       takeScreenShotsOnlyForFailedSpecs: true
 //    }));
 // }


};