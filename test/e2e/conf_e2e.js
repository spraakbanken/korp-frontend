

// var HtmlReporter = require('protractor-html-screenshot-reporter');

exports.config = {

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {'args': ['--disable-extensions']}
  },

  // Spec patterns are relative to the current working directly when protractor is called.
  specs: ['bin/misc.js','bin/map.js', 'bin/autocomplete.js'],

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