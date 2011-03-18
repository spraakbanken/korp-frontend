var model = {};

model.LemgramProxy = function(){};

model.LemgramProxy.prototype = {
		
		lemgramSearch : function(lemgram) {
			var cqp = $.format('[(lex contains "%s")]', lemgram);
			submitFormToServer(cqp);
			return cqp;
		}

		
		
};