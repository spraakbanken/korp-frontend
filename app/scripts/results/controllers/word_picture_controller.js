/** @format */
const korpApp = angular.module("korpApp")

korpApp.directive("wordpicCtrl", () => ({
    controller($scope, $rootScope, $location, searches) {
        $scope.loading = false
        $scope.progress = 0
        $scope.word_pic = $location.search().word_pic != null
        $scope.$watch(
            () => $location.search().word_pic,
            (val) => ($scope.word_pic = Boolean(val))
        )

        $scope.activate = function () {
            $location.search("word_pic", true)
            const search = searches.activeSearch
            const searchVal = search.type === "lemgram" ? unregescape(search.val) : search.val
            return $scope.instance.makeRequest(searchVal, search.type)
        }

        $scope.settings = { showNumberOfHits: "15" }

        $scope.hitSettings = ["15"]

        $scope.minimize = (table) => table.slice(0, $scope.settings.showNumberOfHits)

        $scope.onClickExample = function (event, row) {
            const data = row

            const opts = {}
            opts.ajaxParams = {
                start: 0,
                end: 24,
                command: "relations_sentences",
                source: data.source.join(","),
                corpus: data.corpus,
            }

            return $rootScope.kwicTabs.push({ queryParams: opts })
        }

        $scope.showWordClass = false

        $rootScope.$on("word_picture_data_available", function (event, data) {
            $scope.data = data

            let max = 0
            _.map(data, (form) =>
                _.map(form, function (categories) {
                    if (categories instanceof Array) {
                        return _.map(categories, (cols) =>
                            _.map(cols, function (col) {
                                if (col.table && col.table.length > max) {
                                    max = col.table.length
                                }
                            })
                        )
                    }
                })
            )

            $scope.hitSettings = []
            if (max < 15) {
                $scope.settings = { showNumberOfHits: "1000" }
            } else {
                $scope.hitSettings.push("15")
                $scope.settings = { showNumberOfHits: "15" }
            }

            if (max > 50) {
                $scope.hitSettings.push("50")
            }
            if (max > 100) {
                $scope.hitSettings.push("100")
            }
            if (max > 500) {
                $scope.hitSettings.push("500")
            }

            return $scope.hitSettings.push("1000")
        })

        $scope.localeString = function (lang, hitSetting) {
            if (hitSetting === "1000") {
                return util.getLocaleString("word_pic_show_all", lang)
            } else {
                return (
                    util.getLocaleString("word_pic_show_some", lang) +
                    " " +
                    hitSetting +
                    " " +
                    util.getLocaleString("word_pic_hits", lang)
                )
            }
        }

        $scope.isLemgram = (word) => {
            util.isLemgramId(word)
        }

        $scope.renderTable = (obj) => obj instanceof Array

        $scope.parseLemgram = function (row) {
            const set = row[row.show_rel].split("|")
            const lemgram = set[0]

            let infixIndex = ""
            let concept = lemgram
            infixIndex = ""
            let type = "-"

            const prefix = row.depextra

            if (util.isLemgramId(lemgram)) {
                const match = util.splitLemgram(lemgram)
                infixIndex = match.index
                if (row.dep) {
                    concept = match.form.replace(/_/g, " ")
                } else {
                    concept = "-"
                }
                type = match.pos.slice(0, 2)
            }
            return {
                label: prefix + " " + concept,
                pos: type,
                idx: infixIndex,
                showIdx: !(infixIndex === "" || infixIndex === "1"),
            }
        }

        $scope.getTableClass = (wordClass, parentIdx, idx) =>
            settings["word_picture_conf"][wordClass][parentIdx][idx].css_class

        $scope.getHeaderLabel = function (header, section, idx) {
            if (header.alt_label) {
                return header.alt_label
            } else {
                return `rel_${section[idx].rel}`
            }
        }

        $scope.getHeaderClasses = function (header, token) {
            if (header !== "_") {
                return `lemgram_header_item ${header.css_class}`
            } else {
                let classes = "hit"
                if ($scope.isLemgram(token)) {
                    classes += " lemgram"
                }
                return classes
            }
        }

        $scope.renderResultHeader = function (parentIndex, section, wordClass, index) {
            return section[index] && section[index].table
        }

        $scope.getResultHeader = (index, wordClass) => settings["word_picture_conf"][wordClass][index]

        $scope.fromLemgram = function (maybeLemgram) {
            if (util.isLemgramId(maybeLemgram)) {
                return util.splitLemgram(maybeLemgram).form
            } else {
                return maybeLemgram
            }
        }
    },
}))