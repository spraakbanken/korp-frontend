(function() {
  "use strict";

  describe("Controller: MainCtrl", function() {
    beforeEach(module("korpApp"));
    beforeEach(inject(function($controller) {
      var MainCtrl, scope;
      scope = {};
      return MainCtrl = $controller("MainCtrl", {
        $scope: scope
      });
    }));
    return it("should attach a list of awesomeThings to the scope", function() {
      return expect(scope.awesomeThings.length).toBe(3);
    });
  });

}).call(this);
