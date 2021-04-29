korpApp.controller("SearchCtrl", function($rootScope, $scope, $controller, $location) {
    // resolve globalFilterDef since globalFilter-directive is not used
    $rootScope.globalFilterDef.resolve()

    $controller(window.SearchCtrl, {$scope: $scope})
    $scope.visibleTabs = [false, true, false, false]
    $scope.extendedTmpl = require("../../views/parallel_extended_tmpl.pug")

    $scope.corpusChangeListener() // remove prev listener
    $scope.$on("reduceattrupdate", function() {
        $scope.statCurrentAttrs = settings.corpusListing.getStatsAttributeGroups(settings.corpusListing.getReduceLang())
        $scope.statSelectedAttrs = ($location.search().stats_reduce || "word").split(',')
        insensitiveAttrs = $location.search().stats_reduce_insensitive
        if(insensitiveAttrs)
            $scope.statInsensitiveAttrs = insensitiveAttrs.split(',')
    })


    $scope.settings = settings
    $scope.showStatistics = true
    $scope.showStats = function() {
        return settings.statistics != false
    }
})