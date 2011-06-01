var model = {};

var SearchProxy = {
	initialize : function() {
		
	},
	
	relatedWordSearch : function(lemgram) {
		$.ajax({
			url: "http://spraakbanken.gu.se/ws/saldo-ws/rel/json/" + lemgram,
			success : function(data) {
				$.log("related words success", data);
				simpleSearch.renderSimilarHeader(lemgram, data);
			}
		});
	}
};

var KWICProxy = {
	initialize : function() {
		this.prevRequest = null;
		this.queryData = null;
	},
	makeRequest : function(cqp, start, end, queryData) {
		var self = this;
		kwicResults.num_result = 0;
		cqp	= cqp || $("#cqp_string").val();
		$.log("kwicProxy.makeRequest", cqp);
		
		start = start || 0;
		end = end || $("#num_hits").val()-1;
		
		kwicResults.showPreloader();
		
		var selected_corpora_ids = getSelectedCorpora();
		var selected_uppercased_corpora_ids = $.map(selected_corpora_ids, function(n)
	   	{ 
			return(n.toUpperCase());
	    });
		
		var data = {
			command:'query',
			corpus:selected_uppercased_corpora_ids.join(),
			cqp:cqp,
			start:start,
			end:end,
			defaultcontext: $.keys(settings.defaultContext)[0],
			context : $.grep($.map(selected_corpora_ids, function(id) {
				if(settings.corpora[id].context != null)
					return id.toUpperCase() + ":" + $.keys(settings.corpora[id].context)[0];
			}), Boolean).join(),
			show:[],
			show_struct:[]  
		};
		if(queryData != null) {
			data.querydata = queryData;
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
//		TODO: we should clean this up...
		if($.inArray("saltnld_swe", selected_corpora_ids) != -1) {
			data.show.push("saltnld_nld");
		}

		$("#Pagination").data("cqp", cqp);
		data.show = data.show.join();
		data.show_struct = data.show_struct.join();
		this.prevRequest = data;
		$.ajax({ 
			url: settings.cgi_script, 
			data:data,
			beforeSend : function(jqxhr, settings) {
				self.prevRequest = settings;
			},
			success: function(data) {
				$.log("kwic result", data);
				self.queryData = data.querydata; 
				kwicResults.renderResult(data);
			}
		});
	}
};

var LemgramProxy = {
		
		initialize : function() {
		},
			
		buildAffixQuery : function(isValid, key, value) {
			if(!isValid) return "";
			return $.format('| (%s contains "%s")', [key, value]);
		},
		
		lemgramSearch : function(lemgram, searchPrefix, searchSuffix) {
			lemgramResults.showPreloader();
			
			var cqp = $.format('[(lex contains "%s")%s%s]', 
					[lemgram, this.buildAffixQuery(searchPrefix, "prefix", lemgram), this.buildAffixQuery(searchSuffix, "suffix", lemgram) ]);
			kwicProxy.makeRequest(cqp);
			return cqp;
		},
		
		relationsSearch : function(lemgram) {
			var self = this;
			var corpus = getSelectedCorpora();
			$.ajax({
				url: settings.cgi_script,
				data : {
					command : "relations",
					lemgram : lemgram,
					corpus : $.map(corpus, function(item){return item.toUpperCase();}) 
				},
				beforeSend : function(jqXHR, settings) {
					$.log("before relations send", settings);
					self.prevRequest = settings;
//					if($("#results-lemgram").is(":visible"))
//						util.setJsonLink(settings);
				},
				success : function(data) {
					$.log("relations success", data);
					lemgramResults.renderResult(data, lemgram);
				}	
			});
		},
		
		sblexSearch : function(word, type) {
			var deferred = $.Deferred(function( dfd ){
				$.ajax({
				    url : "http://spraakbanken.gu.se/ws/lexikon", 
				    data : {
				        wf : word,
				        lexikon : "saldom",
				        format : "json"
			        },
				    success : function(data) {
			            var leArray = $.map(data.div, function(item) {
			            	return item.LexicalEntry;
			            });
			            
			            var output = $.grep(leArray, function(le) {
			            	
			            	if(le.pos.slice(-1) == "h") return false;
			            	
		            		var formArray = le.table.form;
			        		for ( var i = 0; i < formArray.length; i++) {
								var form = formArray[i];
								if(form.wf === word && $.inArray(form.param, ["ci", "cm", "c"]) == -1)
									return true;
							}
			        		return false;
			            });
			        	output = $.map(output, function(le) {
			        		return le[type];
			        	});
			        	dfd.resolve(output);
			        }
			        
				});
			}).promise();
			return deferred;
		}
	};

var StatsProxy = {
	initialize : function() {
		this.prevRequest = null;
	},
	makeRequest : function(lemgram) {
		var self = this;
		statsResults.showPreloader();
		var selected_corpora_ids = getSelectedCorpora();
		var selected_uppercased_corpora_ids = $.map(selected_corpora_ids, function(n) {
			return n.toUpperCase();
	    });
		
		$.ajax({ 
			url: settings.cgi_script,
			data : {
				command : "annotationstats",
				annotation : "lex",
				group : "word",
				value : lemgram,
				corpus : selected_uppercased_corpora_ids
			},
			beforeSend : function(jqXHR, settings) {
				self.prevRequest = settings;
			},
			success: function(data) {
				if(data.ERROR != null) {
					$.error("gettings stats failed with error", $.dump(data.ERROR));
					statsResults.showError();
					return;
				}
				statsResults.renderResult(data);
				statsResults.savedData = data;
			}
		
		});
	}
};

model.SearchProxy = new Class(SearchProxy);
model.LemgramProxy = new Class(LemgramProxy);
model.KWICProxy = new Class(KWICProxy);
model.StatsProxy = new Class(StatsProxy);

delete SearchProxy;
delete KWICProxy;
delete LemgramProxy;
delete StatsProxy;