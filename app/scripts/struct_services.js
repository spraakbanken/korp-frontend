/** @format */
const korpApp = angular.module("korpApp")

korpApp.factory("structService", [
    "$http",
    "$q",
    ($http, $q) => ({
        // Memoize the function so that the backend /struct_values is called
        // only once for each combination of corpora, attributes and options
        getStructValues: _.memoize(
            function (corpora, attributes, { count, returnByCorpora, split }) {
                const def = $q.defer()

                const structValue = attributes.join(">")
                if (count == null) {
                    count = true
                }
                if (returnByCorpora == null) {
                    returnByCorpora = true
                }

                const params = {
                    corpus: corpora.join(","),
                    struct: structValue,
                    count,
                }

                if (split) {
                    params.split = _.last(attributes)
                }

                const conf = util.httpConfAddMethod({
                    url: settings["korp_backend_url"] + "/struct_values",
                    params,
                    headers: {},
                })

                _.extend(conf.headers, authenticationProxy.getAuthorizationHeader())

                $http(conf).then(function ({ data }) {
                    let result, values
                    if (data.ERROR) {
                        def.reject()
                        return
                    }

                    if (returnByCorpora) {
                        result = {}
                        for (corpora in data.corpora) {
                            values = data.corpora[corpora]
                            result[corpora] = values[structValue]
                        }
                        def.resolve(result)
                    } else {
                        result = []
                        for (corpora in data.corpora) {
                            values = data.corpora[corpora]
                            result = result.concat(values[structValue])
                        }
                        def.resolve(result)
                    }
                })

                return def.promise
            },
            // Memoize based on the values of all arguments
            (...args) => JSON.stringify(args)
        ),
    }),
])
