korpApp = angular.module "korpApp"

korpApp.factory "structService",  ($http, $q) ->

    getStructValues: (corpora, attributes) ->

        def = $q.defer()

        params =
            command: "struct_values"
            corpus: corpora
            struct: attributes.join ","

        conf =
            url : settings.cgiScript
            params : params
            method : "GET"
            headers : {}

        _.extend conf.headers, model.getAuthorizationHeader()

        $http(conf).success (data) ->
            if data.ERROR
                def.reject()
                return

            def.resolve data.corpora

        return def.promise
