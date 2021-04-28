korpApp.controller("ParallelSearch", function($scope, $location, $rootScope, $timeout, searches) {
    var s = $scope;
    s.negates = [];

    if($location.search().parallel_corpora)
        s.langs = _.map($location.search().parallel_corpora.split(","), function(lang) {
            var obj = {lang: lang};
            if(locationSearch()["cqp_" + lang])
                obj.cqp = locationSearch()["cqp_" + lang];
            return obj;
        })

    else
        s.langs = [{lang: settings.startLang}];
    s.negChange = function() {
        $location.search("search", null)
    }

    var onLangChange = function() {
        c.log("ParallelSearch language change");
        var currentLangList = _.map(s.langs, "lang");
        settings.corpusListing.setActiveLangs(currentLangList);
        $location.search("parallel_corpora", currentLangList.join(","))
        var struct = settings.corpusListing.getLinksFromLangs(currentLangList);
        function getLangMapping(excludeLangs) {
            return _(struct)
                .flatten()
                .filter(function(item) {
                    return !_.includes(excludeLangs, item.lang);
                }).groupBy("lang").value()
        }

        try {
            var output = CQP.expandOperators(s.langs[0].cqp);
        } catch(e) {
            c.log("parallel cqp parsing error", e)
            return
        }
        output += _.map(s.langs.slice(1), function(langobj, i) {
            var neg = s.negates[i + 1] ? "!" : "";
            var langMapping = getLangMapping(currentLangList.slice(0, i + 1));
            var linkedCorpus = _(langMapping[langobj.lang]).map("id").invokeMap("toUpperCase").join("|");

            try {
                var expanded = CQP.expandOperators(langobj.cqp);
            } catch(e) {
                c.log("parallel cqp parsing error", e)
                return
            }
            return ":LINKED_CORPUS:" + linkedCorpus + " " + neg + " " + expanded;
        }).join("");

        _.each(s.langs, function(langobj, i) {
            locationSearch("cqp_" + langobj.lang , langobj.cqp);
        })
        $rootScope.extendedCQP = output;

        // hacky fix to make attributes update when switching languages
        s.$broadcast("corpuschooserchange", [""]);
        $rootScope.$broadcast("reduceattrupdate");
        searches.langDef.resolve();
        return output;
    }
    s.$watch("langs", function() {
        onLangChange()

    }, true);


    s.onSubmit = function() {
        $location.search("search", null)
        $timeout( function() {
            // $location.search("search", "cqp|" + onLangChange())
            util.searchHash("cqp", onLangChange())
            c.log ("onLangChange", onLangChange())
        }, 300) // <--
        // TODO: this is a little hacky.
        // if changed, look at ng-model-option debounce value as well
    }


    s.keydown = function($event) {
        if($event.keyCode == 13) { // enter
            // _.defer()
            var current = $(".arg_value:focus")
            c.log( "current", current)
            if(current.length) {

                $timeout(function() {
                    s.onSubmit()
                }, 0)

            }
        }
    }

    enabledLangsHelper = function(lang) {
        return _(settings.corpusListing.getLinksFromLangs([lang])).flatten().map("lang").uniq().value();
    }

    s.getEnabledLangs = function(i) {
        if(i === 0) {
            if(!s.langs[0].lang) {
                s.langs[0].lang = settings.startLang;
            }
            return enabledLangsHelper(settings.startLang);
        }
        var currentLangList = _.map(s.langs, "lang");
        delete currentLangList[i];
        var firstlang;
        if(s.langs.length)
             firstlang = s.langs[0].lang
        var other = enabledLangsHelper(firstlang || settings.startLang);
        var langResult = _.difference(other, currentLangList);
        if(s.langs[i] && (!s.langs[i].lang)) {
            s.langs[i].lang = langResult[0];
        }
        return langResult;
    };

    s.addLangRow = function() {
        s.langs.push({lang: s.getEnabledLangs()[0]})
    }
    s.removeLangRow = function(i) {
        s.langs.pop();
    }

});