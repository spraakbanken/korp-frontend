
exports.config = {
  params: {
    url: 'http://localhost:9000/'
  },
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
  specs: ['spec/*.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 10000
  },
  directConnect: true,
  restartBrowserBetweenTests: true
};
