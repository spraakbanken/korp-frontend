korpApp = angular.module("korpApp")
korpApp.factory "extendedComponents", () ->
    autocompleteTemplate = """
        <div>
            <input type="text"
                   size="37"
                   ng-model="input"
                   escaper
                   typeahead-min-length="0"
                   typeahead-input-formatter="typeaheadInputFormatter($model)"
                   uib-typeahead="tuple[0] as tuple[1] for tuple in getRows($viewValue)"></input>
        </div>
    """
    selectTemplate = "<select ng-model='input' escaper ng-options='tuple[0] as tuple[1] for tuple in dataset'></select>"
    localize = ($scope) ->
        return (str) ->
            if not $scope.translationKey
                return str
            else
                return util.getLocaleString( ($scope.translationKey or "") + str)

    selectController = (autocomplete) -> ["$scope", "structService", ($scope, structService) ->
        attribute = $scope.$parent.tokenValue.value
        selectedCorpora = settings.corpusListing.selected

        # check which corpora support attributes
        corpora = []
        for corpusSettings in selectedCorpora
            if attribute of corpusSettings.structAttributes or (attribute of corpusSettings.attributes)
                corpora.push corpusSettings.id

        $scope.loading = true
        opts = {count: false, returnByCorpora: false}
        if $scope.type == "set"
            opts.split = true
        structService.getStructValues(corpora, [attribute], opts).then((data) ->
            $scope.loading = false
            localizer = localize($scope)
            console.log("getStructValues data", data)

            dataset = _.map (_.uniq data), (item) -> 
                if item is ""
                    return [item, util.getLocaleString "empty"]
                return [item, localizer item]
            $scope.dataset = _.sortBy dataset, (tuple) -> return tuple[1]
            if not autocomplete
                $scope.input = $scope.input or $scope.dataset[0][0]
        , () ->
            c.log "struct_values error"
        )

        $scope.getRows = (input) ->
            if input
                return _.filter $scope.dataset, (tuple) -> tuple[0].toLowerCase().indexOf(input.toLowerCase()) != -1
            else
                return $scope.dataset

        $scope.typeaheadInputFormatter = (model) ->
            return localize($scope) model
    ]

    # Select-element. Use the following settings in the corpus:
    # - dataset: an object or an array of values
    # - translationKey: a key that will be prepended to the value for lookup in translation files
    # - escape: boolean, will be used by the escaper-directive
    datasetSelect:
        template: selectTemplate
        controller: ["$scope", ($scope) ->
            localizer = localize($scope)
            if _.isArray $scope.dataset
                dataset = _.map $scope.dataset, (item) -> return [item, localizer item]
            else
                dataset = _.map $scope.dataset, (v, k) -> return [k, localizer v]
            $scope.dataset = _.sortBy dataset, (tuple) -> return tuple[1]
            $scope.model = $scope.model or $scope.dataset[0][0]
        ]

    # Select-element. Gets values from "struct_values"-command. Use the following settings in the corpus:
    # - translationKey: a key that will be prepended to the value for lookup in translation files
    # - escape: boolean, will be used by the escaper-directive
    structServiceSelect:
        template: selectTemplate
        controller: selectController false

    # Autocomplete. Gets values from "struct_values"-command. Use the following settings in the corpus:
    # - translationKey: a key that will be prepended to the value for lookup in translation files
    # - escape: boolean, will be used by the escaper-directive
    structServiceAutocomplete:
        template: autocompleteTemplate
        controller: selectController true


    # puts the first values from a dataset paramater into model
    singleValue:
        template: '<input type="hidden">'
        controller: ["$scope", ($scope) ->
            $scope.model = _.values($scope.dataset)[0]
        ]

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
