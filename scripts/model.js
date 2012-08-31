var model = {}; 


var BaseProxy = {
	initialize : function() {
		// progress
		this.prev = "";
		this.progress = 0;
		this.total;
		
		this.total_results = 0;
	},
	
	makeRequest : function() {
		this.prev = "";
		this.progress = 0;
		this.total_results = 0;
		this.total = null;
	},
	
	calcProgress : function(e) {
		var self = this;
		var newText = e.target.responseText.slice(this.prev.length);
		var struct = {};
		try {
			var prefix = newText[0] == "{" ? "" : "{";
			var suffix = newText.slice(-1) == "}" ? "" : "}";
			var json = prefix + newText.slice(0,-2) + suffix;
			
			struct = JSON.parse(json);
		} catch (e) {
			
			try {
				struct = JSON.parse(newText);
			} catch(e) {
				c.log("second json parse failed in ", this);
				return;
			}
		}
        
        $.each(struct, function(key, val) {
            	if(key != "progress_corpora" && key.split("_")[0] == "progress" ) {
            	var currentCorpus = val.corpus || val;
            	
            	var sum = _.chain(currentCorpus.split("|"))
				.map(function(corpus) {
					return parseInt(settings.corpora[corpus.toLowerCase()].info.Size)
				}).reduce(function(a,b){
					return a + b;
				}, 0).value();
            	
            	self.progress += sum;
            	
            	self.total_results += parseInt(val.hits);
            }
            
        });
        var stats = (self.progress / self.total) * 100;
        
        if(this.total == null && "progress_corpora" in struct) {
        	this.total = $.reduce(
    				$.map(struct["progress_corpora"], function(corpus) {
    					return _.chain(corpus.split("|"))
    						.map(function(corpus) {
    							return parseInt(settings.corpora[corpus.toLowerCase()].info.Size)
    						}).reduce(function(a,b){
    							return a + b;
    						}, 0).value();
    				}), 
    				function(val1, val2) {return val1 + val2;});
        }
		
        self.prev = e.target.responseText;
        return {struct : struct, stats : stats, total_results : this.total_results};
	}
};

model.BaseProxy = new Class(BaseProxy);

var SearchProxy = {
	Extends : model.BaseProxy,
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
	Extends : model.BaseProxy,
	initialize : function() {
		this.parent();
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
	
	makeRequest : function(options, page, callback, successCallback, kwicCallback) {
		var self = this;
		this.parent();
		successCallback = successCallback || $.proxy(kwicResults.renderCompleteResult, kwicResults);
		kwicCallback = kwicCallback || $.proxy(kwicResults.renderResult, kwicResults);
		self.progress = 0;
		
		var corpus = settings.corpusListing.stringifySelected();
		if(currentMode == "parallel") {
			corpus = extendedSearch.getCorporaQuery();
		}
		
		var o = $.extend({
			cqp : $("#cqp_string").val(), 
			queryData : null,
			ajaxParams : this.prevAjaxParams,
			success : function(data) {
				successCallback(data);
			},
			error : function(data) {
				c.log("kwic error", data);
				kwicResults.hidePreloader();
			},
			progress : function(data, e) {
				var progressObj = self.calcProgress(e);
				if(progressObj == null) return;
				c.log("progressObj", progressObj)
				
				callback(progressObj);
				if(progressObj["struct"].kwic) {
		        	c.log("found kwic!");
		        	kwicCallback(progressObj["struct"]);
		        }
				
			},
			incremental : $.support.ajaxProgress
		}, kwicResults.getPageInterval(page), options);
		this.prevAjaxParams = o.ajaxParams;
//		kwicResults.num_result = 0;
		c.log("kwicProxy.makeRequest", o.cqp);
		
//		kwicResults.showPreloader();
		
		var data = {
			command:this.command,
			corpus:corpus,
			cqp:o.cqp,
			start:o.start,
			end:o.end,
			defaultcontext: $.keys(settings.defaultContext)[0],
			context : $.grep($.map(_.pluck(settings.corpusListing.selected, "id"), function(id) {
				if(settings.corpora[id].context != null)
					return id.toUpperCase() + ":" + $.keys(settings.corpora[id].context)[0];
			}), Boolean).join(),
			within : "sentence",
			show:[],
			show_struct:[],
			sort : o.sort,
			incremental : o.incremental
		};
		$.extend(data, o.ajaxParams);
		if(o.queryData != null) {
			data.querydata = o.queryData;
		}

		$.each(settings.corpusListing.selected, function(_, corpus) {
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
				
				if(o.incremental == false)
					kwicCallback(data);
				
				o.success(data, o.cqp);
			},
			error : o.error,
			progress : o.progress
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
	Extends : model.BaseProxy,
	initialize : function() {
		this.parent();
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
	
	makeRequest : function(word, type, callback) {
		this.parent();
		var self = this;
		var data = {
			command : "relations",
			word : word,
			corpus : settings.corpusListing.stringifySelected(),
			incremental : $.support.ajaxProgress,
			type : type
		};
		$.ajax({
			url: settings.cgi_script,
			data : data,
			beforeSend : function(jqXHR, settings) {
				c.log("before relations send", settings);
				self.prevRequest = settings;
			},
			error : function(data) {
				c.log("relationsearch abort", arguments);
				lemgramResults.hidePreloader();
			},
			success : function(data) {
				c.log("relations success", data);
				lemgramResults.renderResult(data, word);
			}, progress : function(data, e) {
				var progressObj = self.calcProgress(e);
				if(progressObj == null) return;
				
				callback(progressObj);
			}
		});
	},
	
	relationsWordSearch : function(word) {
		var self = this;
		var data = {
				command : "relations",
				word : word,
				corpus : settings.corpusListing.stringifySelected(),
				incremental : $.support.ajaxProgress
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
		var count = $.grep(["lemgram", findPrefix ? "prefix" : "", findSuffix ? "suffix" : ""], Boolean);
		return $.post(settings.cgi_script, {
			command : "lemgram_count", 
			lemgram : lemgrams,
			count : count.join(","),
			corpus : settings.corpusListing.stringifySelected()
			} 
		);
	}
};

var StatsProxy = {
	Extends : model.BaseProxy,
	initialize : function() {
		this.parent();
		this.prevRequest = null;
		this.currentPage = 0;
		this.page_incr = 25;
	},
	makeRequest : function(cqp, callback) {
		c.log("statsproxy.makeRequest", callback);
		var self = this;
		this.parent();
		statsResults.showPreloader();
		var reduceval = $.bbq.getState("stats_reduce") || "word";
		return $.ajax({ 
			url: settings.cgi_script,
			data : {
				command : "count",
				groupby : reduceval,
				cqp : cqp,
				corpus : settings.corpusListing.stringifySelected(),
				incremental : $.support.ajaxProgress
			},
			beforeSend : function(jqXHR, settings) {
				self.prevRequest = settings;
			},
			error : function(jqXHR, textStatus, errorThrown) {
				c.log("gettings stats error, status: " +	 textStatus);
				statsResults.hidePreloader();
			},
			
			progress : function(data, e) {
				var progressObj = self.calcProgress(e);
				if(progressObj == null) return;
				callback(progressObj);
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
					formatter : settings.reduce_stringify(reduceval)
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
				
				var totalRow = {
					id : "row_total",
					hit_value : "&Sigma;",
					total_value : {"absolute" : data.total.sums.absolute, "relative" : data.total.sums.relative}
				};
				var dataset = [totalRow];
				$.each(data.corpora, function(corpus, obj) {
					totalRow[corpus + "_value"] = {"absolute" : obj.sums.absolute, "relative" : obj.sums.relative};
				});
				var wordArray = $.keys(data.total.absolute);
				
				$.each(wordArray, function(i, word) {
					var row = {
						id : "row" + i,
						hit_value : word,
						total_value : {"absolute" : data.total.absolute[word], "relative" : data.total.relative[word]}
					};
					$.each(data.corpora, function(corpus, obj) {
						row[corpus + "_value"] = {"absolute" : obj.absolute[word], "relative" : obj.relative[word]};
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
		return $.format("<span><span class='relStat'>%s</span> <span class='absStat'>(%s)</span><span>", 
				[util.formatDecimalString(value.relative.toFixed(1), true), prettyNumbers(String(value.absolute))]);
	}
};

model.SearchProxy = new Class(SearchProxy);
model.LemgramProxy = new Class(LemgramProxy);

model.StatsProxy = new Class(StatsProxy);
model.ExamplesProxy = new Class(ExamplesProxy);

delete BaseProxy;
delete SearchProxy;
delete KWICProxy;
delete LemgramProxy;
delete StatsProxy;