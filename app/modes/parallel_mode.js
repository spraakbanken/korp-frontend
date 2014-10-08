
settings.wordpicture = false;
settings.statistics = false;
var start_lang = "swe";

korpApp.controller("SearchCtrl", function($scope) {
    $scope.visibleTabs = [false, true, false, false];
    $scope.extendedTmpl = "modes/parallel_extended_tmpl.html";
});
korpApp.controller("ParallelSearch", function($scope, $location, $rootScope, $timeout) {
	var s = $scope;
	s.negates = [];
	s.onSubmit = function() {
		$location.search("search", null)
		$timeout( function() {
		    // within = s.within unless s.within in _.keys settings.defaultWithin
		    var within;
		    if(!s.within in _.keys(settings.defaultWithin))
			    within = s.within

		    $location.search("within", within || null)
		    $location.search("search", "cqp|" + $rootScope.activeCQP)
		}, 0)
	}	

	s.keydown = function($event) {
		if($event.keyCode == 13) // enter
			s.onSubmit() 
	}
	    
	

	if($location.search().parallel_corpora)
		s.langs = _.map($location.search().parallel_corpora.split(","), function(lang) {
			var obj = {lang : lang};
			if(search()["cqp_" + lang])
				obj.cqp = search()["cqp_" + lang];
			return obj;
		})

	else
		s.langs = [{lang : "swe"}];
	s.negChange = function() {
		$location.search("search", null)
	}
	s.$watch("langs", function() {
		var currentLangList = _.pluck(s.langs, "lang");
		c.log("lang change", currentLangList)
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

		var output = CQP.expandOperators(s.langs[0].cqp);
		output += _.map(s.langs.slice(1), function(langobj, i) {
			var neg = s.negates[i + 1] ? "!" : "";
			var langMapping = getLangMapping(currentLangList.slice(0, i + 1));
			var linkedCorpus = _(langMapping[langobj.lang]).pluck("id").invoke("toUpperCase").join("|");
			return ":LINKED_CORPUS:" + linkedCorpus + " " + neg + " " + CQP.expandOperators(langobj.cqp); 
		}).join("");

		_.each(s.langs, function(langobj, i) {
			search("cqp_" + langobj.lang , langobj.cqp);
		})
		$rootScope.activeCQP = output;
		s.$broadcast("corpuschooserchange")
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

$("#search_options > div:last").remove();
$("#num_hits").prepend("<option value='10'>10</option>");

var c3 = view.KWICResults.prototype.constructor
view.KWICResults = Subclass(view.KWICResults, function() {
	c3.apply(this, arguments);
	this.selected = []
}, {

	selectWord : function(word, scope, sentence) {
		c3.prototype.selectWord.apply(this, arguments)
		this.clearLinks()
		var self = this
		var obj = scope.wd

		if(!obj.linkref) return

		var corpus = settings.corpusListing.get(sentence.corpus)

		function findRef(ref, sentence) {
			var out = null
			_.each(sentence, function(word) {
				if(word.linkref == ref.toString()) {
					out = word
					return false
				}
			})
			return out
		}


		if(sentence.isLinked){
			var sent_index = scope.$parent.$index
			var data = this.getActiveData()
			var mainSent = null
			while(data[sent_index]) {
			 	var sent = data[sent_index]
			 	if(!sent.isLinked) {
			 		mainSent = sent
			 		break
			 	}
				sent_index--
			}
 			c.log( "mainSent", mainSent)

 			var linkNum = Number(obj.linkref)
 			var lang = corpus.id.split("-")[1]
 			var mainCorpus = mainSent.corpus.split("-")[0]

			_.each(mainSent.tokens, function(token) {
				var refs = _.map(_.compact(token["wordlink-" + lang].split("|")), Number)
				if(_.contains(refs, linkNum)) {
					token._link_selected = true
					self.selected.push(token)
				}
			})

		} else {
			var links = _.pick(obj, function(val, key) {
				return _.str.startsWith(key, "wordlink")
			})
			_.each(links, function(val, key) {
				var wordsToLink = _.each(_.compact(val.split("|")), function(num) {
					var lang = key.split("-")[1]
					var mainCorpus = corpus.id.split("-")[0]
					c.log ("corpus.id", corpus.id)

					var link = findRef(num, sentence.aligned[mainCorpus + "-" + lang])
					link._link_selected = true
					self.selected.push(link)
					
				})
			})

		}

		scope.$apply()
	},

	clearLinks : function() {
		_.each(this.selected, function(word) {
			delete word._link_selected
		})
		this.selected = []
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
	contents : ["saltnld-sv"]
};

settings.corporafolders.aspac = {
	title : "ASPAC",
	contents : ["aspacsvru-sv", "aspacsvde-sv", "aspacsven-sv", "aspacsves-sv", "aspacsvfr-sv", "aspacsvit-sv", "aspacsvnl-sv", "aspacsvpt-sv"]
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
			extended_template : selectType.extended_template,
			controller : selectType.controller,
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
};

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
};

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

var linkref = {
	label : "linkref",
	displayType : "hidden"
}
var wordlink = {
	label : "wordlink",
	displayType : "hidden"
}

settings.corpora["saltnld-sv"] = {
	id : "saltnld-sv",
	lang : "swe",
	linked_to : ["saltnld-nl"],
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
		suffix : attrs.suffix,
		linkref : linkref,
		"wordlink-nl" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},

		text_year : {label : "year"},
		text_origlang : {
			label : "origlang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"nld" : "dutch"
			}
		},
		page_n : {label : "page_n"}
	}
};
settings.corpora["saltnld-nl"] = {
	id : "saltnld-nl",
	lang : "nld",
	linked_to : ["saltnld-sv"],
	title: "SALT svenska-nederländska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		linkref : linkref,
		"wordlink-sv" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},

		text_year : {label : "year"},
		text_origlang : {
			label : "origlang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"nld" : "dutch"
			}
		},
		page_n : {label : "page_n"}
	},
	hide : true
};


settings.corpora["aspacsvru-sv"] = {
	id : "aspacsvru-sv",
	lang : "swe",
	linked_to : ["aspacsvru-ru"],
	title: "ASPAC svenska-ryska",
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
		suffix : attrs.suffix,
		linkref : linkref
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"rus" : "russian"
			}
		}
	}
};
settings.corpora["aspacsvru-ru"] = {
	id : "aspacsvru-ru",
	lang : "rus",
	linked_to : ["aspacsvru-sv"],
	title: "ASPAC svenska-ryska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"},
		linkref : linkref
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"rus" : "russian"
			}
		}
	},
	hide : true
};

settings.corpora["aspacsvde-sv"] = {
	id : "aspacsvde-sv",
	lang : "swe",
	linked_to : ["aspacsvde-de"],
	title: "ASPAC svenska-tyska",
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
		suffix : attrs.suffix,
		linkref : linkref,
		"wordlink-de" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"deu" : "german"
			}
		}
	}
};
settings.corpora["aspacsvde-de"] = {
	id : "aspacsvde-de",
	lang : "deu",
	linked_to : ["aspacsvde-sv"],
	title: "ASPAC svenska-tyska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"},
		linkref : linkref,
		"wordlink-sv" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"deu" : "german"
			}
		}
	},
	hide : true
};

settings.corpora["aspacsven-sv"] = {
	id : "aspacsven-sv",
	lang : "swe",
	linked_to : ["aspacsven-en"],
	title: "ASPAC svenska-engelska",
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
		suffix : attrs.suffix,
		linkref : linkref,
		"wordlink-en" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"eng" : "english"
			}
		}
	}
};
settings.corpora["aspacsven-en"] = {
	id : "aspacsven-en",
	lang : "eng",
	linked_to : ["aspacsven-sv"],
	title: "ASPAC svenska-engelska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"},
		linkref : linkref,
		"wordlink-sv" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"rus" : "english"
			}
		}
	},
	hide : true
};

settings.corpora["aspacsves-sv"] = {
	id : "aspacsves-sv",
	lang : "swe",
	linked_to : ["aspacsves-es"],
	title: "ASPAC svenska-spanska",
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
		suffix : attrs.suffix,
		linkref : linkref,
		"wordlink-es" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"spa" : "spanish"
			}
		}
	}
};
settings.corpora["aspacsves-es"] = {
	id : "aspacsves-es",
	lang : "spa",
	linked_to : ["aspacsves-sv"],
	title: "ASPAC svenska-spanska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"},
		linkref : linkref,
		"wordlink-sv" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"spa" : "spanish"
			}
		}
	},
	hide : true
};

settings.corpora["aspacsvfr-sv"] = {
	id : "aspacsvfr-sv",
	lang : "swe",
	linked_to : ["aspacsvfr-fr"],
	title: "ASPAC svenska-franska",
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
		suffix : attrs.suffix,
		linkref : linkref,
		"wordlink-fr" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"fra" : "french"
			}
		}
	}
};
settings.corpora["aspacsvfr-fr"] = {
	id : "aspacsvfr-fr",
	lang : "fra",
	linked_to : ["aspacsvfr-sv"],
	title: "ASPAC svenska-franska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"},
		linkref : linkref,
		"wordlink-sv" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"fra" : "french"
			}
		}
	},
	hide : true
};

settings.corpora["aspacsvit-sv"] = {
	id : "aspacsvit-sv",
	lang : "swe",
	linked_to : ["aspacsvit-it"],
	title: "ASPAC svenska-italienska",
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
		suffix : attrs.suffix,
		linkref : linkref,
		"wordlink-it" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"fra" : "italian"
			}
		}
	}
};
settings.corpora["aspacsvit-it"] = {
	id : "aspacsvit-it",
	lang : "ita",
	linked_to : ["aspacsvit-sv"],
	title: "ASPAC svenska-italienska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"},
		linkref : linkref,
		"wordlink-sv" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"ita" : "italian"
			}
		}
	},
	hide : true
};

settings.corpora["aspacsvnl-sv"] = {
	id : "aspacsvnl-sv",
	lang : "swe",
	linked_to : ["aspacsvnl-nl"],
	title: "ASPAC svenska-nederländska",
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
		suffix : attrs.suffix,
		linkref : linkref,
		"wordlink-nl" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"nld" : "dutch"
			}
		}
	}
};
settings.corpora["aspacsvnl-nl"] = {
	id : "aspacsvnl-nl",
	lang : "nld",
	linked_to : ["aspacsvnl-sv"],
	title: "ASPAC svenska-nederländska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"},
		linkref : linkref,
		"wordlink-sv" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"nld" : "dutch"
			}
		}
	},
	hide : true
};

settings.corpora["aspacsvpt-sv"] = {
	id : "aspacsvpt-sv",
	lang : "swe",
	linked_to : ["aspacsvpt-pt"],
	title: "ASPAC svenska-portugisiska",
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
		suffix : attrs.suffix,
		linkref : linkref,
		"wordlink-pt" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"por" : "portuguese"
			}
		}
	}
};
settings.corpora["aspacsvpt-pt"] = {
	id : "aspacsvpt-pt",
	lang : "por",
	linked_to : ["aspacsvpt-sv"],
	title: "ASPAC svenska-portugisiska",
	context: context.defaultAligned,
	within: {
		"link": "meningspar"
	},
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"},
		linkref : linkref,
		"wordlink-sv" : wordlink
	},
	struct_attributes : {
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_description : {label : "description"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"swe" : "swedish",
				"por" : "portuguese"
			}
		}
	},
	hide : true
};


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
};
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
};


window.cl = settings.corpusListing = new ParallelCorpusListing(settings.corpora);
delete ParallelCorpusListing;
delete context;

