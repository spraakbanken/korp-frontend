korpApp = angular.module("korpApp")
korpApp.factory "extendedComponents", () ->
    selectTemplate = "<select ng-model='input' escaper ng-options='tuple[0] as tuple[1] for tuple in dataset' ></select>"
    localize = ($scope) ->
        return (str) ->
            if not $scope.localize and not $scope.translationKey
                return str
            else
                return util.getLocaleString( ($scope.translationKey or "") + str)

    datasetSelect:
        template: selectTemplate
        controller: ($scope) ->
            localizer = localize($scope)

            $scope.translationKey = $scope.translationKey or ""

            if _.isArray $scope.dataset
                dataset = _.map $scope.dataset, (item) -> return [item, localizer item]
            else
                dataset = _.map $scope.dataset, (v, k) -> return [k, localizer v]

            $scope.dataset = dataset or $scope.dataset
            $scope.dataset = _.sortBy $scope.dataset, (tuple) -> return tuple[1]
            $scope.model = $scope.model or $scope.dataset[0][0]

    structServiceSelect:
        template: selectTemplate
        controller: ($scope, $timeout, structService) ->
            attribute = $scope.$parent.tokenValue.value
            selectedCorpora = settings.corpusListing.getSelectedCorpora()
            
            # check which corpora support attributes
            corpora = []
            for corpus in selectedCorpora
                corpusSettings = settings.corpora[corpus]
                if attribute of corpusSettings.structAttributes or (attribute of corpusSettings.attributes)
                    corpora.push corpus

            structService.getStructValues(corpora, [attribute], false, false).then((data) ->
                localizer = localize($scope)
                dataset = _.map data, (item) -> return [item, localizer item]
                $scope.dataset = _.sortBy dataset, (tuple) -> return tuple[1]
                $scope.input = $scope.input || $scope.dataset[0][0]
            , () ->
                c.log "struct_values error"
            )

    singleValue:
        template: '<input type="hidden">'
        controller: ($scope) ->
            $scope.model = _.values($scope.dataset)[0]

    defaultTemplate: _.template """
                <input ng-model='input' class='arg_value' escaper ng-model-options='{debounce : {default : 300, blur : 0}, updateOn: "default blur"}'
                <%= maybe_placeholder %>>
                <span class='val_mod' popper
                    ng-class='{sensitive : case == "sensitive", insensitive : case == "insensitive"}'>
                        Aa
                </span>
                <ul class='mod_menu popper_menu dropdown-menu'>
                    <li><a ng-click='makeSensitive()'>{{'case_sensitive' | loc:lang}}</a></li>
                    <li><a ng-click='makeInsensitive()'>{{'case_insensitive' | loc:lang}}</a></li>
                </ul>
                """
    defaultController: ["$scope", ($scope) ->
        if $scope.orObj.flags?.c
            $scope.case = "insensitive"
        else
            $scope.case = "sensitive"

        $scope.makeSensitive = () ->
            $scope.case = "sensitive"
            delete $scope.orObj.flags?["c"]

        $scope.makeInsensitive = () ->
            flags = ($scope.orObj.flags or {})
            flags["c"] = true
            $scope.orObj.flags = flags

            $scope.case = "insensitive"
    ]
