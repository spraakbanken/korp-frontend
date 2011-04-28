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
	},
	makeRequest : function(cqp) {
		var self = this;
		kwicResults.num_result = 0;
		cqp	= cqp || $("#cqp_string").val();
		$.log("kwicProxy.makeRequest", cqp);
		
		var start 	= 0;
		var end 	= $("#num_hits").val()-1;
		
		kwicResults.showPreloader();
		
		var selected_corpora_ids = getSelectedCorpora();
		var selected_uppercased_corpora_ids = $.map(selected_corpora_ids, function(n)
	   	{ 
			return(n.toUpperCase());
	    });
		
		var data = {
			command:'query',
			corpus:selected_uppercased_corpora_ids,
			cqp:cqp,
			start:start,
			end:end,
			context:'1 sentence',
			show:[],
			show_struct:[]  
		};

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

		$("#Pagination").data("cqp", cqp);
		this.prevRequest = data;
		$.ajax({ 
			url: settings.cgi_script, 
			data:data,
			beforeSend : function(jqxhr, settings) {
				self.prevRequest = settings;
			},
			success: $.proxy(kwicResults.renderResult, kwicResults),
			error : function(jqXHR, textStatus, errorThrown) {
				$.error("Ajax error when fetching KWIC", jqXHR, textStatus, errorThrown);
			}
		});
	}
};

var LemgramProxy = {
		
		initialize : function() {
		},
			
		lemgramSearch : function(lemgram) {
			lemgramResults.showPreloader();
			var cqp = $.format('[(lex contains "%s")]', lemgram);
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
					if($("#results-lemgram").is(":visible"))
						setJsonLink(settings);
				},
				success : function(data) {
					$.log("relations success", data);
					lemgramResults.renderResult(data, lemgram);
				}	
			});
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
				command : "lemgramstats",
				lemgram : lemgram,
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