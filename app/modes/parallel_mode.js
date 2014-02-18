
settings.wordpicture = false;
settings.statistics = false;
var start_lang = "swe";

korpApp.controller("SearchCtrl", function($scope) {
	c.log("searchctrl", $scope);
    $scope.visibleTabs = [false, true, false, false];
    $scope.extendedTmpl = "modes/parallel_extended_tmpl.html";
});
korpApp.controller("ParallelSearch", function($scope, $location, $rootScope) {
	var s = $scope;

	// s.$on("btn_submit", function() {
	s.onSubmit = function() {
	    $location.search("search", "cqp");
	}
	// });

	if($location.search().parallel_corpora)
		s.langs = _.map($location.search().parallel_corpora.split(","), function(lang) {
			var obj = {lang : lang};
			if(search()["cqp_" + lang])
				obj.cqp = search()["cqp_" + lang];
			return obj;
		})

	else
		// s.langs = [{lang : "swe", cqp : '[word = "apa"]'}];
		s.langs = [{lang : "swe"}];
	c.log ("s.langs", s.langs)

	s.$watch("langs", function() {
		var currentLangList = _.pluck(s.langs, "lang");
		settings.corpusListing.setActiveLangs(currentLangList);
		$location.search("parallel_corpora", currentLangList.join(","))
		var struct = settings.corpusListing.getLinksFromLangs(currentLangList);
		function getLangMapping(excludeLangs) {
			return _(struct)
				.flatten()
				.filter(function(item) {
					return !_.contains(excludeLangs, item.lang);
				}).groupBy("lang").value()
		}


		// c.log ("langMapping", langMapping)
		// query += ":LINKED_CORPUS:" + _(langMapping[lang]).pluck("id").invoke("toUpperCase").join("|") + " " + cqp;

		// TODO: remove LINKED_CORPUS crap from lang.cqp, only apply when searching. 
		var output = s.langs[0].cqp;
		output += _.map(s.langs.slice(1), function(langobj, i) {
			var langMapping = getLangMapping(currentLangList.slice(0, i + 1));
			var linkedCorpus = _(langMapping[langobj.lang]).pluck("id").invoke("toUpperCase").join("|");
			return ":LINKED_CORPUS:" + linkedCorpus + " " + langobj.cqp;
		}).join("");

		c.log("langs cqp", output);
		_.each(s.langs, function(langobj, i) {
			search("cqp_" + langobj.lang , langobj.cqp);
		})
		$rootScope.activeCQP = output;
	}, true);

	s.getEnabledLangs = function(i) {
		if(i === 0) {
			return _(settings.corpusListing.getLinksFromLangs([start_lang])).flatten()
			.pluck("lang").unique().value();
			
		}
		var currentLangList = _.pluck(s.langs, "lang");
		delete currentLangList[i];
		var firstlang;
		if(s.langs.length)
			 firstlang = s.langs[0].lang
		var other =  _(settings.corpusListing.getLinksFromLangs([firstlang || start_lang]))
			.flatten()
			.pluck("lang").unique().value();

		return _.difference(other, currentLangList);

	};
	s.addLangRow = function() {
		s.langs.push({lang : s.getEnabledLangs()[0]})
	}
	s.removeLangRow = function(i) {
		s.langs.pop();
	}

});

// $("#lemgram_list_item").remove();
// $("#results-lemgram").remove();
$("#search_options > div:last").remove();
$("#num_hits").prepend("<option value='10'>10</option>");

var c3 = view.KWICResults.prototype.constructor
view.KWICResults = Subclass(view.KWICResults, function() {
	c3.apply(this, arguments);
}, {

	onWordClick : function(word, sentence) {
		var data = word.tmplItem().data;
		var currentSentence = sentence.aligned;
		if(!currentSentence) currentSentence = sentence;
		var i = Number(data.dephead);
		var aux = $(word.closest("tr").find(".word").get(i - 1));
		this.selectionManager.select(word, aux);

		var isLinked = word.closest("tr").is(".linked_sentence");
		var corpus = isLinked ? _.keys(sentence.aligned)[0] : sentence.corpus.split("|")[0].toLowerCase();

		this.scrollToShowWord(word);

		$("#sidebar").sidebar("updateContent", isLinked ? {} : sentence.structs, data, corpus);
	},

	renderKwicResult : function(data, sourceCQP) {
		var self = this;
		this.renderResult(".results_table.kwic", data, sourceCQP).done(function() {
			var offset = $(".table_scrollarea").scrollLeft(0);
			$(".linked_sentence span:first-child").each(function(i, linked) {
				var mainLeft = $(linked).closest("tr").prev().find("span:first").offset().left;
				$(linked).parent().css("padding-left", Math.round(mainLeft));
			});
			self.centerScrollbar();
		});
	}

});

model.StatsProxy.prototype.makeRequest = function(){};

settings.primaryColor = "#FFF3D8";
settings.primaryLight = "#FFF9EE";

var context = {
	"defaultAligned" : {
		"1 link" : "1 link"
	}
};

settings.corporafolders = {};

settings.corporafolders.europarl = {
	title : "Europarl3",
		contents : ["europarl-da", "europarl-en", "europarl-fi", "europarl-fr", "europarl-el", "europarl-it", "europarl-nl", "europarl-pt", "europarl-es", "europarl-de"]
};

settings.corporafolders.salt = {
	title : "SALT",
	contents : ["saltnld_swe"]
};

settings.corpora = {};

settings.corpora["europarl-sv"] = {
	id : "europarl-sv",
	lang : "swe",
	linked_to : ["europarl-da", "europarl-de", "europarl-el", "europarl-en", "europarl-es", "europarl-fi", "europarl-fr", "europarl-it", "europarl-nl", "europarl-pt"],
	pivot : true,
	title: "Europarl svenska",
	context: context.defaultAligned,
	within: {
		"linkda": "meningspar"
	},
	attributes: {
		pos: attrs.pos,
		msd: attrs.msd,
		lemma: attrs.baseform,
		lex: attrs.lemgram,
		saldo: attrs.saldo,
		dephead: attrs.dephead,
		deprel: attrs.deprel,
		ref: attrs.ref,
		prefix : attrs.prefix,
		suffix : attrs.suffix
	},
	struct_attributes : {
		text_date : {label : "date"},
		text_speaker : {label : "speaker"},
		text_speakerlang : {
			label : "lang",
			displayType : "select",
			dataset : {
				"EN" : "engelska",
				"FI" : "finska",
				"FR" : "franska",
				"NL" : "nederländska",
				"IT" : "italienska",
				"DE" : "tyska",
				"ES" : "spanska",
				"EL" : "grekiska",
				"PT" : "portugisiska",
				"DA" : "danska",
				"HU" : "ungerska",
				"PL" : "polska",
				"MT" : "maltesiska",
				"LT" : "litauiska",
				"SL" : "slovenska",
				"CS" : "tjeckiska",
				"LV" : "lettiska",
				"SV" : "svenska",
				"SK" : "slovakiska",
				"ET" : "estniska"
			}
		}
	},
	hide : true
}

settings.corpora["europarl-da"] = {
	id : "europarl-da",
	lang : "dan",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-danska",
	context: {
		"1 linkda" : "1 link"
	},
	within: {
		"linkda": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
}

settings.corpora["europarl-de"] = {
	id : "europarl-de",
	lang : "deu",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-tyska",
	context: {
		"1 linkde" : "1 link"
	},
	within: {
		"linkde": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora["europarl-el"] = {
	id : "europarl-el",
	lang : "ell",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-grekiska",
	context: {
		"1 linkel" : "1 link"
	},
	within: {
		"linkel": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora["europarl-en"] = {
	id : "europarl-en",
	lang : "eng",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-engelska",
	context: {
		"1 linken" : "1 link"
	},
	within: {
		"linken": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora["europarl-es"] = {
	id : "europarl-es",
	lang : "spa",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-spanska",
	context: {
		"1 linkes" : "1 link"
	},
	within: {
		"linkes": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora["europarl-fi"] = {
	id : "europarl-fi",
	lang : "fin",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-finska",
	context: {
		"1 linkfi" : "1 link"
	},
	within: {
		"linkfi": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora["europarl-fr"] = {
	id : "europarl-fr",
	lang : "fra",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-franska",
	context: {
		"1 linkfr" : "1 link"
	},
	within: {
		"linkfr": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora["europarl-it"] = {
	id : "europarl-it",
	lang : "ita",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-italienska",
	context: {
		"1 linkit" : "1 link"
	},
	within: {
		"linkit": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora["europarl-nl"] = {
	id : "europarl-nl",
	lang : "nld",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-nederländska",
	context: {
		"1 linknl" : "1 link"
	},
	within: {
		"linknl": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora["europarl-pt"] = {
	id : "europarl-pt",
	lang : "por",
	linked_to : ["europarl-sv"],
	title: "Europarl svenska-portugisiska",
	context: {
		"1 linkpt" : "1 link"
	},
	within: {
		"linkpt": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
};

settings.corpora.saltnld_swe = {
	id : "saltnld_swe",
	lang : "swe",
	linked_to : ["saltnld_nld"],
	title: "SALT svenska-nederländska",
	context: context.defaultAligned,
	// context : settings.defaultContext,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: attrs.pos,
		msd: attrs.msd,
		lemma: attrs.baseform,
		lex: attrs.lemgram,
		saldo: attrs.saldo,
		dephead: attrs.dephead,
		deprel: attrs.deprel,
		ref: attrs.ref,
		prefix : attrs.prefix,
		suffix : attrs.suffix
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},

		text_year : {label : "year"},
		text_origlang : {
			label : "origlang",
			displayType : "select",
			dataset: {
				"swe" : "swedish",
				"nld" : "dutch"
			}
		},
		page_n : {label : "page_n"}
	}
}
settings.corpora.saltnld_nld = {
	id : "saltnld_nld",
	lang : "nld",
	linked_to : ["saltnld_swe"],
	title: "SALT svenska-nederländska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},

		text_year : {label : "year"},
		text_origlang : {
			label : "origlang",
			displayType : "select",
			dataset: {
				"swe" : "swedish",
				"nld" : "dutch"
			}
		},
		page_n : {label : "page_n"}
	},
	hide : true
}

settings.corpora["espc-sv"] = {
	id : "espc-sv",
	lang : "swe",
	linked_to : ["espc-en"],
	limited_access : true,
	title: "The English-Swedish Parallel Corpus (ESPC)",
	context: context.defaultAligned,
	context : settings.defaultContext,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: attrs.pos,
		espcmsd: {label : "msd"},
		lemma: attrs.baseform,
		lex: attrs.lemgram,
		saldo: attrs.saldo,
		dephead: attrs.dephead,
		deprel: attrs.deprel,
		ref: attrs.ref,
		prefix : attrs.prefix,
		suffix : attrs.suffix
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_date : {label : "year"}
	}
}
settings.corpora["espc-en"] = {
	id : "espc-en",
	lang : "eng",
	linked_to : ["espc-en"],
	limited_access : true,
	title: "The English-Swedish Parallel Corpus (ESPC)",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_date : {label : "year"}
	},
	hide : true
}


window.cl = settings.corpusListing = new ParallelCorpusListing(settings.corpora);
delete ParallelCorpusListing;
delete context;
