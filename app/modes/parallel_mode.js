
settings.wordpicture = false;
settings.showSimpleSearch = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#search_options > div:last").remove();
$("#num_hits").prepend("<option value='10'>10</option>");

// for the language selects
var lang_prio = ["swe"].reverse();
var start_lang = "swe";

// var c1 = view.ExtendedSearch.prototype.constructor
var ext = view.ExtendedSearch.prototype
view.ExtendedSearch = Subclass(view.ExtendedSearch, function(mainDivId) {
	ext.constructor.call(this, mainDivId);
	// c.log("parallel constructor")
	// this.parent(mainDivId);
	var self = this;
	$("#linkedLang").click(function() {
		self.makeLangRow();
	});
	$("#removeLang").click(function() {
		$(".lang_row:last").remove();
		$("#linkedLang").attr("disabled", null);
		self.onUpdate();

	});
	var langsel = this.getLangSelect().prependTo("#query_table")
	.change(function() {
		self.onUpdate();
		self.invalidate($(this));
	});

	var pc = $.bbq.getState("parallel_corpora");
	if(pc) {
		var self = this;
		pc = pc.split(",").reverse();
		langsel.val(pc.pop());
		$.each(pc, function(i, item) {
			self.makeLangRow(item);
		});
	}
	langsel.change();
}, {


	invalidate : function(select) {
		var index = select.closest(".lang_row,#query_table").index();
		$(".lang_row,#query_table").filter($.format(":gt(%s)", index)).each(function() {
			$("#removeLang").click();
		});
		var langs = this.getEnabledLangs($(".lang_select").first().val());
		if(!langs.length)
			$("#linkedLang").attr("disabled", "disabled");
		else
			$("#linkedLang").attr("disabled", null);

		this.refreshTokens();
	},

	reset : function() {
		// ext.refreshTokens.call(this);
		$(".lang_row", this.main).remove()
		$("#query_table .lang_select", this.main).remove();
		this.getLangSelect().prependTo("#query_table");

		this.invalidate($(".lang_select", this.main).first())
	},

	onUpdate : function() {
		var corps = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});
		$.bbq.pushState({"parallel_corpora" : corps.join(",")});
	},

	makeLangRow : function(start_val) {
		var self = this;
		var newRow = $("<div class='lang_row' />");
		$("#linkedLang").before(newRow);
		this.setupContainer(newRow);
		this.getLangSelect()
		.prependTo(".lang_row:last")
		.change(function() {
			self.invalidate($(this));
		})
		.val(start_val | null).change();

		this.onUpdate();
	},

	getEnabledLangs : function(mainLang) {
		var currentLangList = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});
		var other =  _(settings.corpusListing.getLinksFromLangs([mainLang || start_lang]))
			.flatten()
			.pluck("lang").unique().value();

		return _.difference(other, currentLangList);



		// if(activeLangs.length) {
		// 	var links = settings.corpusListing.getLinksFromLangs(activeLangs);
		// 	output = _(links).flatten().pluck("lang").unique().value();
		// } else {
		// 	output = _(settings.corpusListing.selected).map(function(item) {
		// 		return settings.corpusListing.getLinked(item, true);
		// 	})
		// 	.flatten()
		// 	.pluck("lang")
		// 	.unique()
		// 	.value()
		// }
		// c.log ("output, activeLangs", output, activeLangs)
		// output = _.difference(output, activeLangs);
		// output = output.sort(function(a, b) {
		//     return lang_prio.indexOf(b) - lang_prio.indexOf(a)
		// });

		// return output;

		// var output = [];
		// // get the languages that are enabled given a list of active languages
		// if(activeLangs.length) {

		// 	var enabled = settings.corpusListing.getEnabledByLang(activeLangs[0])
		// 	$.each(activeLangs, function(i, lang) {
		// 		var set = _(settings.corpusListing.getEnabledByLang(lang, true))
		// 			.map(function(item) {
		// 				return settings.corpusListing.getLinked(item);
		// 			})
		// 			.flatten()
		// 			.filter(function(item) {
		// 				return $.inArray(item.lang, activeLangs) == -1;
		// 			})
		// 			.value()

		// 		enabled = _.intersection(enabled, set)

		// 	});
			
		// 	output = _.pluck(enabled , "lang");
		// } else {
		// 	output = _(settings.corpusListing.selected).map(function(item) {
		// 		return settings.corpusListing.getLinked(item, true);
		// 	})
		// 	.flatten()
		// 	.pluck("lang")
		// 	.value()
		// }

		// output = output.sort(function(a, b) {
		//     return lang_prio.indexOf(b) - lang_prio.indexOf(a)
		// });

		// return _.uniq(output);

	},

	getLangSelect : function() {
		var ul = $("<select/>").addClass("lang_select");

		// var prevLang = $(".lang_select:last").val();

		var langs = this.getEnabledLangs($(".lang_select").first().val());


		ul.append($.map(langs, function(item) {
			return $("<option />", {"val" : item}).localeKey(item).get(0);
		}));
		return ul;
	},

	getCorporaQuery : function() {
		var currentLangList = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});

		var struct = settings.corpusListing.getLinksFromLangs(currentLangList);
		var output = [];
		$.each(struct, function(i, item) {
			main = item[0]

			var pair = _.map(item.slice(1), function(corp) {
				return main.id.toUpperCase() + "|" + corp.id.toUpperCase();
			});
			output.push(pair);
		});
		return output.join(",")
	}

});

var c2 = view.AdvancedSearch.prototype.constructor
view.AdvancedSearch = Subclass(view.AdvancedSearch, function() {
	c2.apply(this, arguments);
}, {

	updateCQP : function() {
		var currentLangList = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});

		var struct = settings.corpusListing.getLinksFromLangs(currentLangList);

		function getLangMapping(excludeLangs) {
			return _(struct)
				.flatten()
				.filter(function(item) {
					return !_.contains(excludeLangs, item.lang);
				}).groupBy("lang").value()
		}
		var query = $("#query_table .query_token").map(function() {
	    	return $(this).extendedToken("getCQP");
	    }).get().join(" ");
		if(currentLangList.length > 1) {
			$(".lang_row").each(function(i, item) {			
				cqp = $(this).find(".query_token").map(function() {
			    	return $(this).extendedToken("getCQP");
			    }).get().join(" ");

				var lang = $(".lang_select", this).val();
				var langMapping = getLangMapping(currentLangList.slice(0, i + 1));
				// c.log ("langMapping", langMapping)
				query += ":LINKED_CORPUS:" + _(langMapping[lang]).pluck("id").invoke("toUpperCase").join("|") + " " + cqp;

			});
		}
	    this.setCQP(query);
	    return query;
	}
});

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
settings.parallel_corpora = {};

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
		text_speaker : {label : "speaker"}
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

settings.corpora.espc_swe = {
	id : "espc_swe",
	lang : "swe",
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
settings.corpora.espc_eng = {
	id : "espc_eng",
	lang : "eng",
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
