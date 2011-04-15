var model = {};

model.LemgramProxy = function(){};

model.LemgramProxy.prototype = {
		
		lemgramSearch : function(lemgram) {
			var cqp = $.format('[(lex contains "%s")]', lemgram);
			submitFormToServer(cqp);
			return cqp;
		}
};

model.KWICProxy = function(){
	this.prevRequest = null;
};

model.KWICProxy.prototype = {
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
		

		var selected_corpora = $.map(selected_corpora_ids, function(n)
	   	{ 
			return(settings.corpora[n]);
	    });
	    
	    
	    for (sel in selected_corpora) {
		    $.each(selected_corpora[sel].attributes, function(key,val){
		    	if($.inArray(key, data.show) == -1)
		    		data.show.push(key);
			});
			
		
			if (selected_corpora[sel].struct_attributes) {
				$.each(selected_corpora[sel].struct_attributes, function(key,val){
					if($.inArray(key, data.show_struct) == -1)
						data.show_struct.push(key);
				});
			}
	    }

		$("#Pagination").data("cqp", cqp);
		this.prevRequest = data;
		$.ajax({ url: settings.cgi_script, 
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

model.StatProxy = function() {
};

model.StatProxy.prototype = {
	makeRequest : function() {
		
	}
};