exports.config = {
  params: {
    url: 'http://' + (process.env.KORP_HOST || "localhost") + ':'+ (process.env.KORP_PORT || 9111) +'/'
  },
  seleniumAddress: "http://" + (process.env.SELENIUM || "localhost") + ":4444/wd/hub",
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
        'args': ['--disable-extensions', '--window-size=1500,3000', "--privileged", "--headless"],
        // 'args': ['--disable-extensions', '--window-size=1500,900'],
        // prefs: {
        //     download: {
        //         prompt_for_download: false, 
        //         directory_upgrade: true,
        //         default_directory: 'test/e2e/bin'
        //     }
        // }
    }
  },
  specs: ['spec/*.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 20000
  },
  directConnect: true,
  restartBrowserBetweenTests: true
};
