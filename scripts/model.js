var model = {};

var LemgramProxy = {
		
	initialize : function() {
	},
		
	lemgramSearch : function(lemgram) {
		lemgramResults.showPreloader();
		var cqp = $.format('[(lex contains "%s")]', lemgram);
		submitFormToServer(cqp);
		return cqp;
	}
};

var KWICProxy = {
	initialize : function() {
		this.prevRequest = null;
	},
	makeRequest : function(cqp, start, end) {
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
				this.prevRequest = settings;
				if($("#results").is(":visible"))
					setJsonLink(settings);
			},
			success: $.proxy(kwicResults.renderTable, kwicResults),
			error : function(jqXHR, textStatus, errorThrown) {
				$.error("Ajax error when fetching KWIC", jqXHR, textStatus, errorThrown);
			}
		});
	}
};


var StatsProxy = {
	initialize : function() {
		
	},
	makeRequest : function(lemgram) {
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
			success: function(data) {
				if(data.ERROR != null) {
					$.error("gettings stats failed with error", $.dump(data.ERROR));
					statsResults.showError();
					return;
				}
				statsResults.renderTable(data);
			}
		
		});
	}
};

model.LemgramProxy = new Class(LemgramProxy);
model.KWICProxy = new Class(KWICProxy);
model.StatsProxy = new Class(StatsProxy);

delete KWICProxy;
delete LemgramProxy;
delete StatsProxy;