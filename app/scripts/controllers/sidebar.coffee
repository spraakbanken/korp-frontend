'use strict';

korpApp.controller("SidebarCtrl", ($scope) ->   
  c.log("SidebarCtrl init")
  $scope.data = {}
);

    
 
window.ng_run = (selector, f) ->
  scope = angular.element($(selector).get(0)).scope() 
  g = -> f.apply(scope)
  scope.$apply(g)

window.updateSidebar = (data) ->
  ng_run "#sidebar", -> this.data = data
  
f = -> "ffff   "  