(function() {
  var waitFor;

  waitFor = function(elm) {
    browser.wait(function() {
      return elm.isPresent();
    });
    return browser.wait(function() {
      return elm.isDisplayed();
    });
  };

  describe("page", function() {
    var elm;
    elm = null;
    beforeEach(function() {
      browser.ignoreSynchronization = true;
      browser.get("http://localhost:9000/#?corpus=suc2&cqp=%5B%5D&search=word%7Cha&page=7");
      elm = element(By.css(".results-kwic .pagination .active a"));
      return waitFor(elm);
    });
    it("should go back to 0 when searching anew", function() {
      var input;
      input = element(By.id('simple_text'));
      input.sendKeys("gå");
      input.sendKeys(protractor.Key.ENTER);
      return expect(browser.executeScript("return search().page")).toBe(0);
    });
    return;
    it("should page to the correct page", function() {
      element(By.css(".results-kwic .pagination li:nth-last-child(2)")).click();
      waitFor(elm);
      expect(elm.getText()).toBe("9");
      return expect(browser.executeScript("return search().page")).toBe(8);
    });
    it("should should use the correct start/end values", function() {
      expect(browser.executeScript("return kwicResults.proxy.prevParams.start")).toBe(175);
      return expect(browser.executeScript("return kwicResults.proxy.prevParams.end")).toBe(199);
    });
    return it("should should bring up the correct page", function() {
      expect(elm.getText()).toBe("8");
      return expect(browser.executeScript("return search().page")).toBe(7);
    });
  });

}).call(this);

/*
//@ sourceMappingURL=spec_e2e.js.map
*/