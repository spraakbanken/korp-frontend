



var util = {};
// <!-- SelectionManager
util.SelectionManager = function() {
	$.error("SelectionManager is a static class, don't instantiate it.");
};

util.SelectionManager.select = function(word) {
	
	if(this.selected) {
		this.selected.removeClass("token_selected");
	}
		
	this.selected = word;
	word.addClass("token_selected");
};
util.SelectionManager.deselect = function() {
	if(!this.selected) return;
	this.selected.removeClass("token_selected");
	this.selected = null;
};
// SelectionManager -->

util.getLocaleString = function(key) {
	if(!$.localize.data) {
		$.error("Locale string cannot be found because no data file has been read.");
		return;
	}
	var output = $.localize.data.locale[key];
	if(output == null && key != null)
		return key;
//		$.error("Could not find translation key " + key);
	return output;
};

util.localize = function() {
	$("[rel^=localize]").localize("locale" ,{pathPrefix : "translations", language : $("#languages .lang_selected").data("lang")});
};

util.lemgramToString = function(lemgram, appendIndex) {
	var infixIndex = "";
	if(util.isLemgramId(lemgram)) {
		var match = util.splitLemgram(lemgram);
		if(appendIndex != null && match[2] != "1") {
			infixIndex = $.format("<sup>%s</sup>", match[2]);
		}
		var concept = match[0].replace(/_/g, " ");
		var type = match[1].slice(0, 2);
	}
	else { // missing from saldo, and have the form word_NN instead.
		var concept = lemgram.split("_")[0];
		var type = lemgram.split("_")[1];
	}
	return $.format("%s%s <span class='wordclass_suffix'>(<span rel='localize[%s]'>%s</span>)</span>", 
			[concept, infixIndex, type, util.getLocaleString(type)]);
};

util.lemgramArraytoString = function(lemgramArray, labelFunction) {
	labelFunction = labelFunction || util.lemgramToString;
	var tempArray = $.map(lemgramArray, function(lemgram){
		return labelFunction(lemgram, false);
	});
	return $.map(lemgramArray, function(lemgram) {
		var isAmbigous = $.grep(tempArray, function(tempLemgram) {
			return tempLemgram == labelFunction(lemgram, false);
		}).length > 1;
		return labelFunction(lemgram, isAmbigous);
	});
};

util.lemgramRegexp = /\.\.\w+\.\d\d?(\:\d+)?$/;
util.isLemgramId = function(lemgram) {
	return lemgram.search(util.lemgramRegexp) != -1;
};
util.splitLemgram = function(lemgram) {
	if(!util.isLemgramId(lemgram)) {
		throw new Error("Input to util.splitLemgram is not a lemgram: " + lemgram);
		return;
	}
	return lemgram.match(/(.*?)\.\.(\w+)\.(\d\d?)(\:\d+)?$/).slice(1);
};




util.setJsonLink = function(settings){
	if(settings == null) {
		$.log("failed to update json link");
		return;
	}
	$('#json-link').attr('href', settings.url);
	$('#json-link').show();
};


util.parseQuery = function(){

	var corpus = $.getUrlVar('corpus');
	if (corpus && corpus.length != 0){
		var corp_array = corpus.split(',');
		corpusChooserInstance.corpusChooser("selectItems",corp_array);
		$("#select_corpus").val(corpus);
		didSelectCorpus();
	}
	
	var word = $.getUrlVar('word');
	if(word && word.length != 0){
		$('input[type=text]').val(decodeURIComponent(word));
		advancedSearch.updateCQP();
		kwicProxy.makeRequest();
	}
	
	var saldo = $.getUrlVar('saldo');
	if (saldo && saldo.length != 0){
		$("#cqp_string").val('[(saldo contains "'+saldo+'")]');
		$('a[href="#korp-advanced"]').trigger('click');
		kwicProxy.makeRequest();
	}
	
	var lemgram = $.getUrlVar('lemgram');
	if (lemgram && lemgram.length != 0){
		simpleSearch.renderSimilarHeader(lemgram);
		simpleSearch.selectLemgram(lemgram);
	}
	
	var cqp = $.getUrlVar('cqp');
	if (cqp && cqp.length != 0){
		$("#cqp_string").val(cqp);
		$('a[href="#korp-advanced"]').trigger('click');
		kwicProxy.makeRequest();
	}		
}


function loadCorporaFolderRecursive(first_level, folder) {
	var outHTML;
	if (first_level) 
		outHTML = '<ul>';
	else {
		if(!folder["contents"] || folder["contents"].length == 0) {
			return "";
		}
		outHTML = '<ul title="' + folder.title + '">';
	}
	if(folder) { //This check makes the code work even if there isn't a ___settings.corporafolders = {};___ in config.js
		// Folders
		$.each(folder, function(fol, folVal) {
			if (fol != "contents" && fol != "title")
				outHTML += '<li>' + loadCorporaFolderRecursive(false, folVal) + "</li>";
		});
		// Corpora
		if (folder["contents"] && folder["contents"].length > 0) {
			$.each(folder.contents, function(key, value) {
				outHTML += '<li id="' + value + '">' + settings.corpora[value]["title"] + '</li>';
				added_corpora_ids.push(value);
				
			});
		}
	}
	
	if(first_level) {
		// Add all corpora which have not been added to a corpus
		searchloop: for (var val in settings.corpora) {
			for (var usedid in added_corpora_ids) {
				if (added_corpora_ids[usedid] == val) {
					continue searchloop;
				}
			}
			// Add it anyway:
			outHTML += '<li id="' + val + '">' + settings.corpora[val].title + '</li>';
		}
	}
	
	outHTML += "</ul>";
	return outHTML;
}

/* Goes through the settings.corporafolders and recursively adds the settings.corpora hierarchically to the corpus chooser widget */
function loadCorpora() {
	added_corpora_ids = [];
	outStr = loadCorporaFolderRecursive(true, settings.corporafolders);
	/*var outStr;
	outStr = "<ul>";
	for (var val in settings.corpora) {
    	outStr += '<li id="' + val + '">' + settings.corpora[val].title + '</li>';
    };
    outStr += "</ul>";*/
    corpusChooserInstance = $('#corpusbox').corpusChooser({template: outStr, change : function(corpora) {
    	refreshSelects();
    }});
}