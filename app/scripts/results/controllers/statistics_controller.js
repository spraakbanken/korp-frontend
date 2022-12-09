/** @format */
import statisticsFormatting from "../../../config/statistics_config.js"

const korpApp = angular.module("korpApp")

korpApp.directive("statsResultCtrl", () => ({
    controller($scope, $location, backend, searches, $rootScope) {
        const s = $scope
        s.loading = false
        s.progress = 0
        s.noRowsError = false

        s.$watch(
            () => $location.search().hide_stats,
            (val) => (s.showStatistics = val == null)
        )

        s.$watch(
            () => $location.search().in_order,
            (val) => (s.inOrder = val == null)
        )

        s.shouldSearch = () => s.showStatistics && s.inOrder

        $scope.activate = function () {
            $location.search("hide_stats", null)
            const cqp = searches.getCqpExpr()
            s.showStatistics = true
            return $scope.instance.makeRequest(cqp)
        }

        s.onGraphShow = (data) => $rootScope.graphTabs.push(data)

        s.mapEnabled = settings["map_enabled"]

        s.getGeoAttributes = function (corpora) {
            let attrs = {}
            for (let corpus of settings.corpusListing.subsetFactory(corpora).selected) {
                for (let attr of corpus.private_struct_attributes) {
                    if (attr.indexOf("geo") !== -1) {
                        if (attrs[attr]) {
                            attrs[attr].corpora.push(corpus.id)
                        } else {
                            attrs[attr] = {
                                label: attr,
                                corpora: [corpus.id],
                            }
                        }
                    }
                }
            }

            attrs = _.map(attrs, (val) => val)
            if (attrs && attrs.length > 0) {
                attrs[0].selected = true
            }

            s.mapAttributes = attrs
        }

        s.mapToggleSelected = function (index, event) {
            _.map(s.mapAttributes, (attr) => (attr.selected = false))

            const attr = s.mapAttributes[index]
            attr.selected = true
            return event.stopPropagation()
        }

        s.showMap = function () {
            const selectedRows = s.instance.getSelectedRows()

            if (selectedRows.length == 0) {
                s.noRowsError = true
                return
            }
            s.noRowsError = false

            const cqpExpr = CQP.expandOperators(searches.getCqpExpr())

            const cqpExprs = {}
            for (let rowIx of selectedRows) {
                if (rowIx === 0) {
                    continue
                }
                var row = s.instance.getDataAt(rowIx)
                const { searchParams } = s.instance
                const cqp = statisticsFormatting.getCqp(row.statsValues, searchParams.ignoreCase)
                const parts = searchParams.reduceVals.map((reduceVal) => row.formattedValue[reduceVal])
                cqpExprs[cqp] = parts.join(", ")
            }

            const selectedAttributes = _.filter(s.mapAttributes, "selected")
            if (selectedAttributes.length > 1) {
                c.log("Warning: more than one selected attribute, choosing first")
            }
            const selectedAttribute = selectedAttributes[0]

            const within = settings.corpusListing.subsetFactory(selectedAttribute.corpora).getWithinParameters()
            return $rootScope.mapTabs.push(backend.requestMapData(cqpExpr, cqpExprs, within, selectedAttribute))
        }
    },
}))