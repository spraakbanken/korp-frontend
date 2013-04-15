
settings.wordpicture = false;
settings.showSimpleSearch = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#search_options > div:last").remove();
$("#num_hits").prepend("<option value='10'>10</option>");

// for the language selects
var lang_prio = ["swe"].reverse();

var c1 = view.ExtendedSearch.prototype.constructor
view.ExtendedSearch = Subclass(view.ExtendedSearch, function(mainDivId) {
	c1.call(this, mainDivId);
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
		var activeLangs = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});
		var langs = this.getEnabledLangs(activeLangs);
		if(!langs.length)
			$("#linkedLang").attr("disabled", "disabled");
		else
			$("#linkedLang").attr("disabled", null);

		this.refreshTokens();
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
		$("#removeLang").before(newRow);
		this.setupContainer(newRow);
		this.getLangSelect()
		.prependTo(".lang_row:last")
		.change(function() {
			self.invalidate($(this));
		})
		.val(start_val | null).change();

		this.onUpdate();
	},

	getEnabledLangs : function(activeLangs) {
		var output = [];
		// get the languages that are enabled given a list of active languages
		if(activeLangs.length) {

			var enabled = settings.corpusListing.getEnabledByLang(activeLangs[0])
			$.each(activeLangs, function(i, lang) {
				var set = _(settings.corpusListing.getEnabledByLang(lang, true))
					.map(function(item) {
						return settings.corpusListing.getLinked(item);
					})
					.flatten()
					.filter(function(item) {
						return $.inArray(item.lang, activeLangs) == -1;
					})
					.unique()
					.value()

				enabled = _.intersection(enabled, set)

			});
			
			output = _.pluck(enabled , "lang");
		} else {
			output = _(settings.corpusListing.selected).map(function(item) {
				return settings.corpusListing.getLinked(item, true);
			})
			.flatten()
			.pluck("lang")
			.unique()
			.value()
		}

		output = output.sort(function(a, b) {
		    return lang_prio.indexOf(b) - lang_prio.indexOf(a)
		});

		return output;

	},

	getLangSelect : function() {
		var ul = $("<select/>").addClass("lang_select");

		// var prevLang = $(".lang_select:last").val();
		var activeLangs = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});

		var langs = this.getEnabledLangs(activeLangs);
		
		ul.append($.map(langs, function(item) {
			return $("<option />", {"val" : item}).localeKey(item).get(0);
		}));
		return ul;
	},

	getCorporaQuery : function() {
		var currentLangList = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});
		var struct = settings.corpusListing.getCorporaByLangs(currentLangList);
		var output = [];
		$.each(struct, function(i, item) {
			main = item[0]

			var pair = _.map(item.slice(1), function(corp) {
				return main.id.toUpperCase() + "|" + corp.id.toUpperCase();
			});
			output.push(pair);
		});
		return output.join(",")
	},

	// getAttributeQuery : function(attr) {
	// 	//gets the within and context queries
	// 	var currentLangList = _.map($(".lang_select").get(), function(item) {
	// 		return $(item).val();
	// 	});
	// 	var struct = settings.corpusListing.getCorporaByLangs(currentLangList);
			
	// 	var output = [];
	// 	$.each(struct, function(i, item) {
	// 		var main = item[0];

	// 		var pair = _.map(item.slice(1), function(corp) {
	// 			var a = _.keys(corp[attr])[0];
	// 			return main.id.toUpperCase() + "|" + corp.id.toUpperCase() + ":" + a;
	// 		});
	// 		output.push(pair);
	// 	});
	// 	return output.join(",")
	// }

});

var c2 = view.AdvancedSearch.prototype.constructor
view.AdvancedSearch = Subclass(view.AdvancedSearch, function() {
	c2.apply(this, arguments);
}, {

	updateCQP : function() {

		var query = $("#query_table .query_token").map(function() {
	    	return $(this).extendedToken("getCQP");
	    }).get().join(" ");

		$(".lang_row").each(function(i, item) {
			query += ": <LINKED_CORPUS> ";
			query += $(this).find(".query_token").map(function() {
		    	return $(this).extendedToken("getCQP");
		    }).get().join(" ");
		});

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
		contents : ["europarl-da", "europarl-en", "europarl-de"]
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
	linked_to : ["europarl-en", "europarl-da", "europarl-de"],
	title: "Svenska-danska",
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
	},
	hide : true
}

settings.corpora["europarl-da"] = {
	id : "europarl-da",
	lang : "dan",
	linked_to : ["europarl-sv"],
	title: "Svenska-danska",
	context: {
		"1 linkda" : "1 linkda"
	},
	within: {
		"linkda": "meningspar"
	},
	attributes: {
	},
	struct_attributes : {
	}
}

settings.corpora["europarl-en"] = {
	id : "europarl-en",
	lang : "eng",
	linked_to : ["europarl-sv"],
	title: "Svenska-engelska",
	context: {
		"1 linken" : "1 linken"
	},
	within: {
		"linken": "meningspar"
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
	title: "Svenska-tyska",
	context: {
		"1 linkde" : "1 linkde"
	},
	within: {
		"linkde": "meningspar"
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
	title: "Svenska-nederländska",
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
	title: "Svenska-nederländska",
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
	title: "The English-Swedish Parallel Corpus (ESPC) svenska-engelska",
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
	title: "ESPC svenska-engelska",
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


settings.corpusListing = new ParallelCorpusListing(settings.corpora);
delete ParallelCorpusListing;
delete context;
