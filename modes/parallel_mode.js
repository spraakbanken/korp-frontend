var ParallelSimpleSearch = {
	Extends : view.SimpleSearch,
	
	initialize : function(mainDivId) {
		this.parent(mainDivId);
	}
};


settings.wordpicture = false;
settings.showSimpleSearch = false;
$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#search_options > div:last").remove();

var ParallelExtendedSearch = {
	Extends : view.ExtendedSearch,
	initialize : function(mainDivId) {
		this.parent(mainDivId);
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
	},
	
	invalidate : function(select) {
		var index = select.closest(".lang_row,#query_table").index();
		$(".lang_row,#query_table").filter($.format(":gt(%s)", index)).each(function() {
			$("#removeLang").click();
		});
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
	
	getParentCorpora : function() {
		var output = [];
		$.each(settings.corpusListing.selected, function(i, corp) {
			var childCorpora = $.grepObj(settings.parallel_corpora[corp.parent], function(val, key) {
				return key != "default";
			});
			output = output.concat(childCorpora);
		});
		return output;
		
	},
	
	getLinkedTo : function(lang) {
		var corps = _.filter(settings.corpusListing.selected, function(item) {
			return item["lang"] == lang;
		});
		
		return _.flatten(_.map(corps, function(item) {
			return settings.corpusListing.getLinked(item);
		}));
	},
	
	getSiblingCorpora : function(corp) {
		
		var childCorpora = $.grepObj(settings.parallel_corpora[corp.parent], function(val, key) {
			return key !== "default";
		});
		delete childCorpora[corp.id];
		return _.values(childCorpora);
	},
	
	getLangSelect : function() {
		var ul = $("<select/>").addClass("lang_select");
		var langs = [];
		
		var prevLang = $(".lang_select:last").val();
		
		if(prevLang) {
			other_corp = this.getLinkedTo(prevLang);
			langs = _.pluck(other_corp , "lang");
		} else {
			$.each(settings.corpusListing.selected, function(i, corp) {
				var childCorpora = $.grepObj(settings.parallel_corpora[corp.parent], function(val, key) {
					return key !== "default";
				});
				langs = langs.concat(_.pluck(childCorpora, "lang"));
				
			});
			
			langs = _.uniq(langs);
		}
		
		var currentLangList = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});
		if(currentLangList.length + 1 >= langs.length)	
			$("#linkedLang").attr("disabled", "disabled");
		else 
			$("#linkedLang").attr("disabled", null);
			
		
		
		ul.append($.map(langs, function(item) {
			return $("<option />", {"val" : item}).localeKey(item).get(0);
		}));
		return ul;
	},
	
	getCorporaByLang : function() {
		var parents = this.getParentCorpora();
		
		var currentLangList = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});
		// remove corpora for lang not used
		var children = _.flatten(_.map(parents, function(p) {
			var children = _.values(p);
			children = _.filter(children, function(item) {
				return $.inArray(item.lang, currentLangList) != -1;
			});
			return children;
		}));
		
		if(currentLangList.length == 1) {
			var self = this;
			var output = [];
			$.each(children, function(i, item) {
				output.push([item].concat(self.getSiblingCorpora(item)));
			});
			
			return {"not_linked" : output};
		} else {
			function countParentsForLang(corp) {
				return _.chain(_.values(parents))
				.reduce(function(memo, p) {
					var langs = _.pluck(_.values(p), "lang");
					if(langs.contains(corp.lang)) memo++;
					return memo;
				}, 0).value();
			}
			var childWithLeastParents = _.min(children, countParentsForLang);
			var output = _.filter(children, function(item) {
				return item.parent == childWithLeastParents.parent;
			});
			return {"linked" : _.uniq(output)};
		}
	},
	
	getCorporaQuery : function() {
		var currentLangList = _.map($(".lang_select").get(), function(item) {
			return $(item).val();
		});
		var struct = this.getCorporaByLang();
		if(struct.linked) {
			var struct = struct.linked.sort(function(a,b) {
//				c.log("inarray", $.inArray(currentLangList, a.lang), $.inArray(currentLangList, b.lang))
				return $.inArray(a.lang, currentLangList) - $.inArray(b.lang, currentLangList); 
			});
			return _.chain(struct)
				.pluck("id")
				.invoke("toUpperCase")
				.value().join("|");
		} else {
			return _.map(struct.not_linked, this.stringifyCorporaSet).join(",");
		}
	},
	
	stringifyCorporaSet : function(corpusList) {
		return _.chain(corpusList)
		.pluck("id")
		.invoke("toUpperCase")
		.value().join("|");
	}
	
	
	
};

var ParallelAdvancedSearch = {
	Extends : view.AdvancedSearch,
	
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
};

var ParallelKWICResults = {
	Extends : view.KWICResults,
	
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
	
//	renderResult : function(target, data, sourceCQP, pDef) {
//	},
	
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
	
};

var ParallelStatsProxy = {
	Extends : model.StatsProxy,
	makeRequest : function() {}
};


view.SimpleSearch = new Class(ParallelSimpleSearch);
view.ExtendedSearch = new Class(ParallelExtendedSearch);
view.AdvancedSearch = new Class(ParallelAdvancedSearch);
view.KWICResults = new Class(ParallelKWICResults);
model.StatsProxy = new Class(ParallelStatsProxy);
delete ParallelSimpleSearch;
delete ParallelExtendedSearch;
delete ParallelAdvancedSearch;
delete ParallelKWICResults;
delete ParallelStatsProxy;


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
		contents : ["europarlda_sv"]
};

settings.corporafolders.salt = {
	title : "SALT",
	contents : ["saltnld_swe"]
};

settings.corpora = {};
settings.parallel_corpora = {};

settings.parallel_corpora.europarl = {
	"default" : "europarlda_sv",
	europarlda_sv : {
		id : "europarlda_sv",
		lang : "swe",
		parent : "europarl",
		title: "Svenska-danska",
		context: context.defaultAligned, 
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
		}
	},
	europarlda_da : {
		id : "europarlda_da",
		lang : "dan",
		parent : "europarl",
		title: "Svenska-danska", 
		context: context.defaultAligned, 
		within: {
			"link": "meningspar"
		}, 
		attributes: {
		},
		struct_attributes : {
		},
		hide : true
	}
};


settings.parallel_corpora.salt = {
	"default" : "saltnld_swe", 
	saltnld_swe : {
		id : "saltnld_swe",
		lang : "swe",
		parent : "salt",
		title: "Svenska-nederländska", 
		context: context.defaultAligned, 
		context : settings.defaultContext,
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
			text_origlang : {label : "origlang"},
			page_n : {label : "page_n"}
			
		}
	},
	saltnld_nld : {
		id : "saltnld_nld",
		parent : "salt",
		lang : "nld",
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
			text_origlang : {label : "origlang"},
			page_n : {label : "page_n"}
		},
		hide : true
	}
};

$.each(settings.parallel_corpora, function(corpora, struct) {
	$.each(struct, function(key, corp) {
		if(key == "default") return;
		
		settings.corpora[corp.id] = corp;
	});
});



settings.corpusListing = new ParallelCorpusListing(settings.parallel_corpora);
delete ParallelCorpusListing;
delete context;
$.extend(settings.corpora, settings.corpusListing.struct);
