



var util = {};
// <!-- SelectionManager
util.SelectionManager = function() {
	$.error("SelectionManager is a static class, don't instantiate it.");
};

util.SelectionManager.select = function(word, aux) {
	if(word == null || !word.length) return;
	if(this.selected) {
		this.selected.removeClass("word_selected token_selected");
		this.aux.removeClass("word_selected aux_selected");
	}
		
	this.selected = word;
	this.aux = aux;
	aux.addClass("word_selected aux_selected");
	return word.addClass("word_selected token_selected");
};
util.SelectionManager.deselect = function() {
	if(!this.selected) return;
	this.selected.removeClass("word_selected token_selected");
	this.selected = null;
	this.aux.removeClass("word_selected aux_selected");
	this.aux = null;
};
util.SelectionManager.hasSelected = function() {
	return this.selected != null;
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
	var lang = $("#languages .lang_selected").data("lang");
	$("[rel^=localize]").localize("locale" ,{
		pathPrefix : "translations", 
		language : lang
	});
	
	$("optgroup").each(function() {
		$(this).attr("label", util.getLocaleString($(this).data("localeString")).toLowerCase());
	});
	
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
	else { // missing from saldo, and has the form word_NN instead.
		var concept = lemgram.split("_")[0];
		var type = lemgram.split("_")[1];
	}
	return $.format("%s%s <span class='wordclass_suffix'>(<span rel='localize[%s]'>%s</span>)</span>", 
			[concept, infixIndex, type, util.getLocaleString(type)]);
};

util.saldoRegExp = /(.*?)\.\.(\d\d?)(\:\d+)?$/;
util.saldoToString = function(saldoId, appendIndex) {
	var match = saldoId.match(util.saldoRegExp);
	var infixIndex = "";
	if(appendIndex != null && match[2] != "1")
		infixIndex = $.format("<sup>%s</sup>", match[2]);
	return $.format("%s%s", [match[1].replace(/_/g, " "), infixIndex]);
};
util.sblexArraytoString = function(idArray, labelFunction) {
	labelFunction = labelFunction || util.lemgramToString;
	var tempArray = $.map(idArray, function(lemgram){
		return labelFunction(lemgram, false);
	});
	return $.map(idArray, function(lemgram) {
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

util.splitSaldo = function(saldo) {
	return saldo.match(util.saldoRegExp);
};

util.setJsonLink = function(settings){
	if(settings == null) {
		$.log("failed to update json link");
		return;
	}
	$('#json-link').attr('href', settings.url);
	$('#json-link').show();
};

util.searchHash = function(type, value) {
	$.bbq.pushState({search: type + "|" + value, page : 0});
};



function loadCorporaFolderRecursive(first_level, folder) {
	var outHTML;
	if (first_level) 
		outHTML = '<ul>';
	else {
		/*if(!folder["contents"]) {
			return "";
		} */
		outHTML = '<ul title="' + folder.title + '" description="' + folder.description + '">';
	}
	if(folder) { //This check makes the code work even if there isn't a ___settings.corporafolders = {};___ in config.js
		// Folders
		$.each(folder, function(fol, folVal) {
			if (fol != "contents" && fol != "title" && fol != "description")
				outHTML += '<li>' + loadCorporaFolderRecursive(false, folVal) + "</li>";
		});
		// Corpora
		if (folder["contents"] && folder["contents"].length > 0) {
			$.each(folder.contents, function(key, value) {
				$.log(value);
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

/* Helper function to turn "8455999" into "8 455 999" */
function prettyNumbers(numstring) {
	var regex = /(\d+)(\d{3})/;
	var outStrNum = numstring;
  	while (regex.test(outStrNum)) {
    	outStrNum = outStrNum.replace(regex, '$1' + ' ' + '$2');
  	}
  	return outStrNum;
}

/* Goes through the settings.corporafolders and recursively adds the settings.corpora hierarchically to the corpus chooser widget */
function loadCorpora() {
	added_corpora_ids = [];
	outStr = loadCorporaFolderRecursive(true, settings.corporafolders);
	corpusChooserInstance = $('#corpusbox').corpusChooser({template: outStr, change : function(corpora) {
		$.log("corpus changed", corpora);
		$.bbq.pushState({"corpus" : corpora.join(",")});
    	extendedSearch.refreshSelects();
    }, infoPopup: function(corpusID) {
    	var maybeInfo = ""
    	if(settings.corpora[corpusID].description)
    		maybeInfo = "<br/><br/>" + settings.corpora[corpusID].description;
    	var numTokens = settings.corpora[corpusID]["info"]["Size"];
    	return "<b>" + settings.corpora[corpusID].title + "</b>" + maybeInfo + "<br/><br/>" + util.getLocaleString("corpselector_numberoftokens") + ": <b>" + prettyNumbers(numTokens) + "</b>";
    }, infoPopupFolder: function(indata) {
    	var corporaID = indata.corporaID;
    	var desc = indata.description;
    	var totalTokens = 0;
    	$(corporaID).each(function(key,oneID) {
    		
    		totalTokens += parseInt(settings.corpora[oneID]["info"]["Size"]);
    	});
    	var maybeInfo = ""
    	if(desc && desc != "")
    		maybeInfo = desc + "<br/><br/>";
    	var glueString = "";
    	if(corporaID.length == 1)
    		glueString = util.getLocaleString("corpselector_corporawith_sing");
    	else
    		glueString = util.getLocaleString("corpselector_corporawith_plur");
    	return "<b>" + indata.title + "</b><br/><br/>" + maybeInfo + "<b>" + corporaID.length + "</b> " + glueString + ":<br/><br/><b>" + prettyNumbers(totalTokens.toString()) + "</b> tokens";
    }});
}