/** @format */
let html = String.raw
export const extendedParallelComponent = {
    template: html`
        <div ng-keydown="$ctrl.keydown($event)">
            <div ng-repeat="l in $ctrl.langs">
                <select
                    ng-model="l.lang"
                    ng-options="langstr as (langstr | loc:$root.lang) for langstr in $ctrl.getEnabledLangs($index)"
                    ng-change="$ctrl.onLangChange()"
                ></select>
                <label
                    uib-tooltip="{{'negate_explanation' | loc:$root.lang}} "
                    ng-show="!$first"
                    for="negate_chk{{$index}}"
                    >{{"not_containing" | loc:$root.lang}}</label
                >
                <input
                    type="checkbox"
                    id="negate_chk{{$index}}"
                    ng-show="!$first"
                    ng-model="$ctrl.negates[$index]"
                    ng-change="$ctrl.negChange()"
                />
                <extended-tokens
                    cqp="l.cqp"
                    cqp-change="$ctrl.cqpChange($index)(cqp)"
                    parallell-lang="l.lang"
                ></extended-tokens>
            </div>
            <input
                class="btn btn-default btn-sm"
                id="linkedLang"
                ng-disabled="!$ctrl.getEnabledLangs($ctrl.langs.length).length"
                ng-click="$ctrl.addLangRow()"
                type="submit"
                value="{{'add_lang' | loc:$root.lang}}"
            />
            <input
                class="btn btn-default btn-sm"
                id="removeLang"
                ng-if="$ctrl.langs.length > 1"
                ng-click="$ctrl.removeLangRow($index)"
                type="submit"
                value="{{'remove_lang' | loc:$root.lang}}"
            />
            <button class="btn btn-default btn-sm" ng-click="$ctrl.onSubmit()">{{'search' | loc:$root.lang}}</button>
        </div>
    `,
    bindings: {
        parallel: "<",
    },
    controller: [
        "$location",
        "$rootScope",
        "$timeout",
        "searches",
        function ($location, $rootScope, $timeout, searches) {
            const ctrl = this

            ctrl.initialized = false

            ctrl.$onInit = () => {
                ctrl.onLangChange()
                ctrl.initialized = true

                $rootScope.$on("corpuschooserchange", () => ctrl.onLangChange(false))
            }

            ctrl.negates = []

            if ($location.search().parallel_corpora) {
                ctrl.langs = _.map($location.search().parallel_corpora.split(","), function (lang) {
                    var obj = { lang: lang, cqp: "[]" }
                    if (locationSearch()["cqp_" + lang]) {
                        obj.cqp = locationSearch()["cqp_" + lang]
                    }
                    return obj
                })
            } else {
                ctrl.langs = [{ lang: settings["start_lang"], cqp: "[]" }]
            }

            ctrl.cqpChange = (idx) => (cqp) => {
                if (ctrl.langs[idx].cqp != cqp) {
                    ctrl.langs[idx].cqp = cqp
                    onCQPChange()
                }
            }

            ctrl.negChange = function () {
                $location.search("search", null)
            }

            const onCQPChange = () => {
                const currentLangList = _.map(ctrl.langs, "lang")
                var struct = settings.corpusListing.getLinksFromLangs(currentLangList)
                function getLangMapping(excludeLangs) {
                    return _(struct)
                        .flatten()
                        .filter(function (item) {
                            return !_.includes(excludeLangs, item.lang)
                        })
                        .groupBy("lang")
                        .value()
                }
                function expandCQP(cqp) {
                    try {
                        return CQP.expandOperators(cqp)
                    } catch (e) {
                        c.log("parallel cqp parsing error", e)
                        return cqp
                    }
                }

                var output = expandCQP(ctrl.langs[0].cqp)

                output += _.map(ctrl.langs.slice(1), function (langobj, i) {
                    const langMapping = getLangMapping(currentLangList.slice(0, i + 1))
                    const linkedCorpus = _(langMapping[langobj.lang]).map("id").invokeMap("toUpperCase").join("|")
                    const expanded = expandCQP(langobj.cqp)
                    const neg = ctrl.negates[i + 1] ? "!" : ""
                    return ":LINKED_CORPUS:" + linkedCorpus + " " + neg + " " + expanded
                }).join("")

                _.each(ctrl.langs, function (langobj, i) {
                    if (!_.isEmpty(langobj.lang)) {
                        locationSearch("cqp_" + langobj.lang, langobj.cqp)
                    }
                })
                $rootScope.extendedCQP = output
                return output
            }

            ctrl.onLangChange = function (broadcast = true) {
                var currentLangList = _.map(ctrl.langs, "lang")
                settings.corpusListing.setActiveLangs(currentLangList)
                $location.search("parallel_corpora", currentLangList.join(","))

                // hacky fix to make attributes update when switching languages
                if (ctrl.initialized && broadcast) {
                    $rootScope.$broadcast("corpuschooserchange", [""])
                }
                searches.langDef.resolve()
            }

            ctrl.onSubmit = function () {
                $location.search("search", null)
                $timeout(function () {
                    util.searchHash("cqp", onCQPChange())
                }, 0)
            }

            ctrl.keydown = function ($event) {
                if ($event.keyCode == 13) {
                    // enter
                    var current = $(".arg_value:focus")
                    if (current.length) {
                        $timeout(function () {
                            ctrl.onSubmit()
                        }, 300)
                    }
                }
            }

            const enabledLangsHelper = function (lang) {
                return _(settings.corpusListing.getLinksFromLangs([lang]))
                    .flatten()
                    .map("lang")
                    .uniq()
                    .value()
            }

            ctrl.getEnabledLangs = function (i) {
                if (i === 0) {
                    if (!ctrl.langs[0].lang) {
                        ctrl.langs[0].lang = settings["start_lang"]
                    }
                    return enabledLangsHelper(settings["start_lang"])
                }
                var currentLangList = _.map(ctrl.langs, "lang")
                delete currentLangList[i]
                var firstlang
                if (ctrl.langs.length) firstlang = ctrl.langs[0].lang
                var other = enabledLangsHelper(firstlang || settings["start_lang"])
                var langResult = _.difference(other, currentLangList)
                if (ctrl.langs[i] && !ctrl.langs[i].lang) {
                    ctrl.langs[i].lang = langResult[0]
                }
                return langResult
            }

            ctrl.addLangRow = function () {
                ctrl.langs.push({ lang: ctrl.getEnabledLangs()[0], cqp: "[]" })
                ctrl.onLangChange()
            }
            ctrl.removeLangRow = function (i) {
                const lang = ctrl.langs.pop()
                locationSearch("cqp_" + lang.lang, null)
                ctrl.onLangChange()
            }
        },
    ],
}
