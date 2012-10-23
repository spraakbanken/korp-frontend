(function() {
  'use strict';

  window.SidebarCtrl = function($scope) {
    c.log("SidebarCtrl init");
    return $scope.hello = "hello from angular";
  };

}).call(this);
