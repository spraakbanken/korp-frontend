exports.config = {
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
