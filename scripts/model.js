var model = {};

var SearchProxy = {
	initialize : function() {
		
	},
	
	relatedWordSearch : function(lemgram) {
		$.ajax({
			url: "http://spraakbanken.gu.se/ws/saldo-ws/rel/json/" + lemgram,
			success : function(data) {
				$.log("related words success");
				simpleSearch.renderSimilarHeader(lemgram, data);
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
		this.pendingRequest.abort();
	},
	
	makeRequest : function(options, page) {
		var self = this;
		
		var o = $.extend({
			cqp : $("#cqp_string").val(), 
			queryData : null,
			ajaxParams : this.prevAjaxParams,
			success : function(data) {kwicResults.renderResult(data);}
		}, kwicResults.getPageInterval(page), options);
		this.prevAjaxParams = o.ajaxParams;
//		kwicResults.num_result = 0;
		$.log("kwicProxy.makeRequest", o.cqp);
		
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
			show_struct:[]  
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
//		TODO: we should clean this up...
		if($.inArray("saltnld_swe", selected_corpora_ids) != -1) {
			data.show.push("saltnld_nld");
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
				$.log("kwic result", data);
				self.queryData = data.querydata; 
				o.success(data, o.cqp);
			}
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
		this.pendingRequest = null;
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
			abort : function(data) {
				$.log("relationsearch abort", arguments);
			},
			success : function(data) {
				$.log("relations success", data);
				lemgramResults.renderResult(data, lemgram);
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
			    dataType : "jsonp",
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

model.StatsProxy = new Class(StatsProxy);
model.ExamplesProxy = new Class(ExamplesProxy);

delete SearchProxy;
delete KWICProxy;
delete LemgramProxy;
delete StatsProxy;