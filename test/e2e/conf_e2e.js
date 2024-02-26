exports.config = {
  // Protractor (webdriver-manager) doesn't pull ChromeDriver versions above 114, so use the chromedriver package instead.
  // Thanks @jan-molak https://github.com/angular/protractor/issues/5563#issuecomment-1736459776
  chromeDriver: require("chromedriver/lib/chromedriver").path,
  params: {
    url: 'http://' + (process.env.KORP_HOST || "localhost") + ':'+ (process.env.KORP_PORT || 9112) +'/'
  },
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
        'args': ['--disable-extensions', '--window-size=1500,3000', "--privileged", "--headless"],
    }
  },
  specs: ['spec/*.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 20000
  },
  directConnect: true,
  restartBrowserBetweenTests: true,
  SELENIUM_PROMISE_MANAGER: false
};

// Protractor seems to add 4 listeners to run, and then 1 for each test (`it()`). Default max is 10.
// TODO Find out what the listeners are and how not to remove them instead.
process.setMaxListeners(20);