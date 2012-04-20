var model = {};

var SearchProxy = {
	initialize : function() {
		
	},
	
	relatedWordSearch : function(lemgram) {
		$.ajax({
			url: "http://spraakbanken.gu.se/ws/saldo-ws/grel/json/" + lemgram,
			success : function(data) {
				c.log("related words success");
				
				var lemgrams = [];
				$.each(data, function(i, item) {
					lemgrams = lemgrams.concat(item.rel);
				});
				var hasAnyFreq = false;
				lemgramProxy.lemgramCount(lemgrams).done(function(freqs) {
					$.each(data, function(i, item) {
						item.rel = $.grep(item.rel, function(lemgram) {
							if(freqs[lemgram])
								hasAnyFreq = true;
							return !!freqs[lemgram];
						});
					});
					c.log("hasAnyFreq", hasAnyFreq, data);
					if(hasAnyFreq)
						simpleSearch.renderSimilarHeader(lemgram, data);
					else
						simpleSearch.removeSimilarHeader();
				});
				
			}
		});
	}
};

var KWICProxy = {
	initialize : function() {
		this.prevRequest = null;
		this.queryData = null;
		this.command = "query";
		this.prevAjaxParams = null;
		this.pendingRequest = {abort : $.noop};
	},
	
	abort : function() {
		if(this.pendingRequest)
			this.pendingRequest.abort();
	},
	
	makeRequest : function(options, page) {
		var self = this;
		
		var o = $.extend({
			cqp : $("#cqp_string").val(), 
			queryData : null,
			ajaxParams : this.prevAjaxParams,
			success : function(data) {kwicResults.renderResult(data);},
			error : function(data) {kwicResults.hidePreloader();}
		}, kwicResults.getPageInterval(page), options);
		this.prevAjaxParams = o.ajaxParams;
//		kwicResults.num_result = 0;
		c.log("kwicProxy.makeRequest", o.cqp);
		
//		kwicResults.showPreloader();
		
		var selected_corpora_ids = getSelectedCorpora();
		var selected_uppercased_corpora_ids = $.map(selected_corpora_ids, function(n)
	   	{ 
			return(n.toUpperCase());
	    });
		
		var data = {
			command:this.command,
			corpus:selected_uppercased_corpora_ids.join(),
			cqp:o.cqp,
			start:o.start,
			end:o.end,
			defaultcontext: $.keys(settings.defaultContext)[0],
			context : $.grep($.map(selected_corpora_ids, function(id) {
				if(settings.corpora[id].context != null)
					return id.toUpperCase() + ":" + $.keys(settings.corpora[id].context)[0];
			}), Boolean).join(),
			within : "sentence",
			show:[],
			show_struct:[],
			sort : o.sort
		};
		$.extend(data, o.ajaxParams);
		if(o.queryData != null) {
			data.querydata = o.queryData;
		}

		var selected_corpora = $.map(selected_corpora_ids, function(n) {
			return(settings.corpora[n]);
	    });
	    
		$.each(selected_corpora, function(_, corpus) {
			$.each(corpus.attributes, function(key,val){
				if($.inArray(key, data.show) == -1)
					data.show.push(key);
			});
			
			if (corpus.struct_attributes != null) {
				$.each(corpus.struct_attributes, function(key,val){
					if($.inArray(key, data.show_struct) == -1)
						data.show_struct.push(key);
				});
			}
		});
//		TODO: we should clean this up... looks terrible.
		if (currentMode == "parallel") {
			if($.inArray("saltnld_swe", selected_corpora_ids) != -1) {
				data.show.push("saltnld_nld");
			}
			if($.inArray("europarlda_sv", selected_corpora_ids) != -1) {
				data.show.push("europarlda_da");
			}
		}

//		$(".pagination:visible").data("cqp", o.cqp);
		data.show = data.show.join();
		data.show_struct = data.show_struct.join();
		this.prevRequest = data;
		this.pendingRequest = $.ajax({ 
			url: settings.cgi_script, 
			data:data,
			beforeSend : function(jqxhr, settings) {
				self.prevRequest = settings;
			},
			success: function(data, status, jqxhr) {
				c.log("kwic result", data);
				self.queryData = data.querydata; 
				o.success(data, o.cqp);
			},
			error : o.error
		});
	}
};
model.KWICProxy = new Class(KWICProxy);

var ExamplesProxy = {
	Extends : model.KWICProxy,
	initialize : function() {
		this.parent();
		this.command = "relations_sentences";
	}
};

var LemgramProxy = {
		
	initialize : function() {
		this.pendingRequest = {abort : $.noop};
	},
		
	buildAffixQuery : function(isValid, key, value) {
		if(!isValid) return "";
		return $.format('| (%s contains "%s")', [key, value]);
	},
	
	lemgramSearch : function(lemgram, searchPrefix, searchSuffix) {
		var cqp = $.format('[(lex contains "%s")%s%s]', 
				[lemgram, this.buildAffixQuery(searchPrefix, "prefix", lemgram), this.buildAffixQuery(searchSuffix, "suffix", lemgram) ]);
		return cqp;
	},
	
	relationsSearch : function(lemgram) {
		var self = this;
		var corpus = getSelectedCorpora();
		var data = {
				command : "relations",
				lemgram : lemgram,
				corpus : $.map(corpus, function(item){return item.toUpperCase();})
			};
		$.ajax({
			url: settings.cgi_script,
			data : data,
			beforeSend : function(jqXHR, settings) {
				c.log("before relations send", settings);
				self.prevRequest = settings;
//					if($("#results-lemgram").is(":visible"))
//						util.setJsonLink(settings);
			},
			error : function(data) {
				c.log("relationsearch abort", arguments);
				lemgramResults.hidePreloader();
			},
			success : function(data) {
				c.log("relations success", data);
				lemgramResults.renderResult(data, lemgram);
			}	
		});
	},
	
	relationsWordSearch : function(word) {
		var self = this;
		var corpus = getSelectedCorpora();
		var data = {
				command : "relations",
				word : word,
				corpus : $.map(corpus, function(item){return item.toUpperCase();})
			};
		$.ajax({
			url: "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp_word.cgi",
			data : data,
			beforeSend : function(jqXHR, settings) {
				c.log("before relations send", settings);
				self.prevRequest = settings;
//					if($("#results-lemgram").is(":visible"))
//						util.setJsonLink(settings);
			},
			error : function(data) {
				c.log("relationsearch abort", arguments);
				lemgramResults.hidePreloader();
			},
			success : function(data) {
				c.log("relations success", data);
				lemgramResults.renderResult(data, word);
			}	
		});
	},
	
	abort : function() {
		this.pendingRequest.abort();
		this.pendingRequest = {abort : $.noop};
	},
	
	sblexSearch : function(word, type) {
		var self = this;
		var deferred = $.Deferred(function( dfd ){
			self.pendingRequest = $.ajax({
			    url : "http://spraakbanken.gu.se/ws/lexikon",
			    data : {
			        wf : word,
			        lexikon : "saldom",
			        format : "json",
			        "sms-forms" : false
		        },
			    success : function(data, textStatus, xhr) {
			    	if(data.count == 0) {
			    		dfd.reject();
			    		return;
			    	}
			    	var div = $.isPlainObject(data.div) ? [data.div] : data.div;
		            var output = $.map(div, function(item) {
		            	return item.LexicalEntry[type];
		            });
		            
		        	dfd.resolve(output, textStatus, xhr);
		        },
		        error : function(jqXHR, textStatus, errorThrown) {
		        	c.log("sblex error", jqXHR, textStatus, errorThrown);
		        	dfd.reject();
		        }
		        
			});
		}).promise();
		return deferred;
	},
	
	lemgramCount : function(lemgrams, findPrefix, findSuffix) {
		var selected_corpora_ids = getSelectedCorpora();
		var selected_uppercased_corpora_ids = $.map(selected_corpora_ids, function(n) {
			return n.toUpperCase();
	    });
		var count = $.grep(["lemgram", findPrefix ? "prefix" : "", findSuffix ? "suffix" : ""], Boolean);
		return $.post(settings.cgi_script, {
			command : "lemgram_count", 
			lemgram : lemgrams,
			count : count.join(","),
			corpus : selected_uppercased_corpora_ids
			} 
		);
	}
};

var StatsProxy = {
	initialize : function() {
		this.prevRequest = null;
		this.currentPage = 0;
		this.page_incr = 25;
	},
	makeRequest : function(cqp, range) {
		var self = this;
		statsResults.showPreloader();
		var selected_corpora_ids = getSelectedCorpora();
		var selected_uppercased_corpora_ids = $.map(selected_corpora_ids, function(n) {
			return n.toUpperCase();
	    });
//		range = range || {start : 0, end : 1000};
		$.ajax({ 
			url: settings.cgi_script,
			data : {
				command : "count",
				groupby : extendedSearch.getReduction(),
				cqp : cqp,
				corpus : selected_uppercased_corpora_ids
			},
			beforeSend : function(jqXHR, settings) {
				self.prevRequest = settings;
			},
			error : function(jqXHR, textStatus, errorThrown) {
				c.log("gettings stats error, status: " +	 textStatus);
				statsResults.hidePreloader();
			},
			success : function(data) {
				if(data.ERROR != null) {
					c.log("gettings stats failed with error", $.dump(data.ERROR));
					statsResults.resultError(data);
					return;
				}
				
				var columns = [{
					id : "hit",
					name : "stats_hit",
					field : "hit_value",
					sortable : true,
					formatter : self.hitFormatter
				},
				{
					id : "total",
					name : "stats_total",
					field : "total_value",
					sortable : true,
					formatter : self.valueFormatter
				}];
				$.each($.keys(data.corpora).sort(), function(i, corpus) {
					columns.push({
						id : corpus,
						name : settings.corpora[corpus.toLowerCase()].title,
						field : corpus + "_value",
						sortable : true,
						formatter : self.valueFormatter
					});
				});
				
				var dataset = [];
				var wordArray = $.keys(data.total.absolute);
				
				$.each(wordArray, function(i, word) {
					var row = {
						id : "row" + i,
						hit_value : word,
						total_value : {"absolute" : data.total.absolute[word], "relative" : data.total.relative[word]}
//						toString : function() {
//							return data.total.relative[word] || "0";
//						}
						
					};
					$.each(data.corpora, function(corpus, obj) {
						row[corpus + "_value"] = {"absolute" : obj.absolute[word], "relative" : obj.relative[word]}; // + obj.relative[word];
					});
					dataset.push(row);
				});
				statsResults.savedData = data;
				statsResults.savedWordArray = wordArray;
				statsResults.renderResult(columns, dataset);
			}
		
		});
	},
	
	valueFormatter : function(row, cell, value, columnDef, dataContext) {
		if (!value.relative && !value.absolute)
            return "";
		return $.format("<span><span class='relStat'>%s</span> <span class='absStat'>(%s)</span><span>", [util.formatDecimalString(value.relative.toFixed(1), true), prettyNumbers(String(value.absolute))]);
	},
	
	hitFormatter : function(row, cell, value, columnDef, dataContext) {
		function filterCorpora(rowObj) {
			return $.grepObj(rowObj, function(value, key) {
				return key != "total_value" && $.isPlainObject(value);
			});
		}
		
		var corpora = $.grepObj(filterCorpora(dataContext), function(value, key) {
			return value.relative != null;
		});
		corpora = $.map($.keys(corpora), function(item) {
			return item.split("_")[0].toLowerCase();
		});
		var output = $.format("<span class='link' data-value='%s' data-corpora='%s'>%s</span>", 
				[dataContext.hit_value, $.toJSON(corpora), value]);
		if(corpora.length > 1)
			output += $.format('<img id="circlediagrambutton__%s" src="img/stats2.png" class="arcDiagramPicture"/>', value);
		return output;
	}
	
};

model.SearchProxy = new Class(SearchProxy);
model.LemgramProxy = new Class(LemgramProxy);

model.StatsProxy = new Class(StatsProxy);
model.ExamplesProxy = new Class(ExamplesProxy);

delete SearchProxy;
delete KWICProxy;
delete LemgramProxy;
delete StatsProxy;