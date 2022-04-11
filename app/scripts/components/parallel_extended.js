/** @format */

let html = String.raw
export const parallelExtendedComponent = {
    template: html`
    <div ng-keydown="$ctrl.keydown($event)">
      <div ng-repeat="l in $ctrl.langs">
        <select ng-model="l.lang" ng-options="langstr as (langstr | loc:lang) for langstr in $ctrl.getEnabledLangs($index)"></select>
        <label uib-tooltip="{{'negate_explanation' | loc:lang}} " ng-show="!$first" for="negate_chk{{$index}}">{{"not_containing" | loc:lang}}</label>
        <input type="checkbox" id="negate_chk{{$index}}" ng-show="!$first" ng-model="negates[$index]" ng-change="negChange()"/>
        <div id="query_table" extended_list="extended_list" cqp="l.cqp"  cqp-change="$ctrl.cqpChange($index)(cqp)"></div>
      </div>
      <input class="btn btn-default btn-sm" id="linkedLang" ng-disabled="!$ctrl.getEnabledLangs($ctrl.langs.length).length" ng-click="$ctrl.addLangRow()" type="submit" value="{{'add_lang' | loc:lang}}"/>
      <input class="btn btn-default btn-sm" id="removeLang" ng-if="$ctrl.langs.length > 1" ng-click="$ctrl.removeLangRow($index)" type="submit" value="{{'remove_lang' | loc:lang}}"/>
      <button class="btn btn-default btn-sm" ng-click="$ctrl.onSubmit()">{{'search' | loc:lang}}</button>
    </div>
    `,
    bindings: {
        parallel: "<",
    },
    controller: [
        "$location", "$rootScope", "$timeout", "searches",
        function ($location, $rootScope, $timeout, searches) {
            const ctrl = this

            ctrl.initialized = false

            ctrl.$onInit = () => {
                onLangChange()
                ctrl.initialized = true
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
                ctrl.langs[idx].cqp = cqp
                onLangChange()
            }

            ctrl.negChange = function () {
                $location.search("search", null)
            }
        
            var onLangChange = function () {
                var currentLangList = _.map(ctrl.langs, "lang")
                settings.corpusListing.setActiveLangs(currentLangList)
                $location.search("parallel_corpora", currentLangList.join(","))
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
        
                try {
                    var output = CQP.expandOperators(ctrl.langs[0].cqp)
                } catch (e) {
                    c.log("parallel cqp parsing error", e)
                    return
                }
                output += _.map(ctrl.langs.slice(1), function (langobj, i) {
                    var neg = ctrl.negates[i + 1] ? "!" : ""
                    var langMapping = getLangMapping(currentLangList.slice(0, i + 1))
                    var linkedCorpus = _(langMapping[langobj.lang]).map("id").invokeMap("toUpperCase").join("|")
        
                    try {
                        var expanded = CQP.expandOperators(langobj.cqp)
                    } catch (e) {
                        c.log("parallel cqp parsing error", e)
                        return
                    }
                    return ":LINKED_CORPUS:" + linkedCorpus + " " + neg + " " + expanded
                }).join("")
        
                _.each(ctrl.langs, function (langobj, i) {
                    if (!_.isEmpty(langobj.lang)) {
                        locationSearch("cqp_" + langobj.lang, langobj.cqp)
                    }
                })
                $rootScope.extendedCQP = output
        
                // hacky fix to make attributes update when switching languages
                if (ctrl.initialized) {
                    $rootScope.$broadcast("corpuschooserchange", [""])
                }
                searches.langDef.resolve()
                return output
            }
        
            ctrl.onSubmit = function () {
                $location.search("search", null)
                $timeout(function () {
                    util.searchHash("cqp", onLangChange())
                }, 300) // <--
                // TODO: this is a little hacky.
                // if changed, look at ng-model-option debounce value as well
            }
        
            ctrl.keydown = function ($event) {
                if ($event.keyCode == 13) {
                    // enter
                    var current = $(".arg_value:focus")
                    if (current.length) {
                        $timeout(function () {
                            ctrl.onSubmit()
                        }, 0)
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
                onLangChange()
            }
            ctrl.removeLangRow = function (i) {
                const lang = ctrl.langs.pop()
                locationSearch("cqp_" + lang.lang, null)
                onLangChange()
            }
        },
    ],
}
