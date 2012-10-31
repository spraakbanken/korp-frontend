(function() {
  'use strict';

  var f;

  korpApp.controller("SidebarCtrl", function($scope) {
    c.log("SidebarCtrl init");
    return $scope.data = {};
  });

  window.ng_run = function(selector, f) {
    var g, scope;
    scope = angular.element($(selector).get(0)).scope();
    g = function() {
      return f.apply(scope);
    };
    return scope.$apply(g);
  };

  window.updateSidebar = function(data) {
    return ng_run("#sidebar", function() {
      return this.data = data;
    });
  };

  f = function() {
    return "ffff   ";
  };

}).call(this);
