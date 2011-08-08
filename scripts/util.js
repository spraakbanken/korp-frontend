var util = {};
// <!-- SelectionManager
util.SelectionManager = function() {
	this.selected = $();
	this.aux = $();
};

util.SelectionManager.prototype.select = function(word, aux) {
	if(word == null || !word.length) return;
	if(this.selected.length) {
		this.selected.removeClass("word_selected token_selected");
		this.aux.removeClass("word_selected aux_selected");
	}
		
	this.selected = word;
	
	this.aux = aux || $();
	this.aux.addClass("word_selected aux_selected");
	return word.addClass("word_selected token_selected");
};
util.SelectionManager.prototype.deselect = function() {
	if(!this.selected.length) return;
	this.selected.removeClass("word_selected token_selected");
	this.selected = $();
	this.aux.removeClass("word_selected aux_selected");
	this.aux = $();
};
util.SelectionManager.prototype.hasSelected = function() {
	return this.selected.length > 0;
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
	var lang = $("#languages").radioList("getSelected").data("lang");
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
// Helper function to turn 1.2345 into 1,2345 (locale dependent)
util.localizeFloat = function(float, nDec) {
	var lang = $("#languages").radioList("getSelected").data("lang");
	var sep = null;
	nDec = nDec || float.toString().split(".")[1].length;
	
	if(lang == "sv") {
		sep = ",";
	} else if(lang == "en") {
		sep = ".";
	}
	return $.format("%." + nDec + "f", float).replace(".", sep);
};

util.formatDecimalString = function(x, mode) { // Use "," instead of "." if Swedish, if mode is 
	var decimalSeparator = util.getLocaleString("util_decimalseparator");
	if(mode)
		return x.replace(".",'<span rel="localize[util_decimalseparator]">' + decimalSeparator + '</span>');
	else
		return x.replace(".", decimalSeparator);
};


/* Helper function to turn "8455999" into "8 455 999" */
function prettyNumbers(numstring) {
	var regex = /(\d+)(\d{3})/;
	var outStrNum = numstring;
  	while (regex.test(outStrNum)) {
    	outStrNum = outStrNum.replace(regex, '$1' + '<span rel="localize[util_numbergroupseparator]">' + util.getLocaleString("util_numbergroupseparator") + '</span>' + '$2');
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
    	extendedSearch.refreshTokens();
    }, infoPopup: function(corpusID) {
    	var maybeInfo = "";
    	if(settings.corpora[corpusID].description)
    		maybeInfo = "<br/><br/>" + settings.corpora[corpusID].description;
    	var numTokens = settings.corpora[corpusID]["info"]["Size"];
    	var numSentences = settings.corpora[corpusID]["info"]["Sentences"];
    	var sentenceString = "-";
    	if (numSentences)
    		sentenceString = prettyNumbers(numSentences.toString());
    	return '<b><img src="img/korp_icon.png" style="margin-right:4px; width:24px; height:24px; vertical-align:middle; margin-top:-1px"/>' + settings.corpora[corpusID].title + "</b>" + maybeInfo + "<br/><br/>" + util.getLocaleString("corpselector_numberoftokens") + ": <b>" + prettyNumbers(numTokens) + "</b><br/>" + util.getLocaleString("corpselector_numberofsentences") + ": <b>" + sentenceString + "</b>";
    }, infoPopupFolder: function(indata) {
    	var corporaID = indata.corporaID;
    	var desc = indata.description;
    	var totalTokens = 0;
    	var totalSentences = 0;
    	var missingSentenceData = false;
    	$(corporaID).each(function(key,oneID) {
    		totalTokens += parseInt(settings.corpora[oneID]["info"]["Size"]);
    		var oneCorpusSentences = settings.corpora[oneID]["info"]["Sentences"];
    		if (oneCorpusSentences)
    			totalSentences += parseInt(oneCorpusSentences);
    		else
    			missingSentenceData = true;
    	});
    	var totalSentencesString = prettyNumbers(totalSentences.toString());
    	if (missingSentenceData)
    		totalSentencesString += "+";
    	var maybeInfo = "";
    	if(desc && desc != "")
    		maybeInfo = desc + "<br/><br/>";
    	var glueString = "";
    	if(corporaID.length == 1)
    		glueString = util.getLocaleString("corpselector_corporawith_sing");
    	else
    		glueString = util.getLocaleString("corpselector_corporawith_plur");
    	return '<b><img src="img/folder.png" style="margin-right:4px; vertical-align:middle; margin-top:-1px"/>' + indata.title + "</b><br/><br/>" + maybeInfo + "<b>" + corporaID.length + "</b> " + glueString + ":<br/><br/><b>" + prettyNumbers(totalTokens.toString()) + "</b> " + util.getLocaleString("corpselector_tokens") + "<br/><b>" + totalSentencesString + "</b> " + util.getLocaleString("corpselector_sentences");
    }});
}

/* Returns an array of all the selected corpora's IDs in uppercase */
function getSelectedCorpora() {
	return corpusChooserInstance.corpusChooser("selectedItems");
}

function mapSelectedCorpora(f) {
	return $.map(getSelectedCorpora(), function(item) {
		return f(settings.corpora[item]);
	});
}
// takes an array of mapping objs and returns their intersection
function mapping_intersection(mappingArray) {
	return $.reduce(mappingArray, function(a,b) {
		var output = {};
		$.each(a, function(key, value) {
			if(b[key] != null)
				output[key] = value;
		});
		return output;
	});
}

function mapping_union(mappingArray) {
	return $.reduce(mappingArray, function(a, b) {
		return $.extend({}, a, b);
	}) || {};
}

function getCurrentAttributes() {
	var attrs = mapSelectedCorpora(function(corpus) {
		return corpus.attributes;
	});
	
	return invalidateAttrs(attrs);
	
}
function getStructAttrs() {
	var attrs = mapSelectedCorpora(function(corpus) {
		$.each(corpus.struct_attributes, function(key, value) {
			value["isStructAttr"] = true; 
		});
		return corpus.struct_attributes;
	});
	
	return invalidateAttrs(attrs);
}

function invalidateAttrs(attrs) {
	var union = mapping_union(attrs);
	var intersection = mapping_intersection(attrs);
	$.each(union, function(key, value) {
		if(intersection[key] == null) {
			value["disabled"] = true;
		} else {
			delete value["disabled"];
		}
	});
	return union;
}

function regescape(s) {
    return s.replace(/[\.|\?|\+|\*|\|\'|\"]/g, "\\$&");
}

util.browserWarn = function() {
	$.reject({
		reject : {
			all : false,
			msie5 : true, msie6 : true, msie7 : true, msie8 : true
		},
		imagePath : "img/browsers/",
		display: ['firefox','chrome','safari','opera'],
		browserInfo: { // Settings for which browsers to display   
	        firefox: {   
	            text: 'Firefox', // Text below the icon   
	            url: 'http://www.mozilla.com/firefox/' // URL For icon/text link   
	        },   
	        safari: {   
	            text: 'Safari',   
	            url: 'http://www.apple.com/safari/download/'   
	        },   
	        opera: {   
	            text: 'Opera',   
	            url: 'http://www.opera.com/download/'   
	        },   
	        chrome: {   
	            text: 'Chrome',   
	            url: 'http://www.google.com/chrome/'   
	        }
	        ,   
	        msie: {   
	            text: 'Internet Explorer',   
	            url: 'http://www.microsoft.com/windows/Internet-explorer/'   
	        }
		},
		header: 'Du använder en omodern webbläsare', // Header of pop-up window   
	    paragraph1: 'Korp använder sig av moderna webbteknologier som inte stödjs av din webbläsare. En lista av de mest populära moderna alternativen visas nedan. Firefox rekommenderas varmt.', // Paragraph 1   
	    paragraph2: '', // Paragraph 2
	    closeMessage: 'Du kan fortsätta ändå, men med begränsad funktionalitet.', // Message displayed below closing link   
	    closeLink: 'Stäng varningen' // Text for closing link   
//		header: 'Did you know that your Internet Browser is out of date?', // Header of pop-up window   
//	    paragraph1: 'Your browser is out of date, and may not be compatible with our website. A list of the most popular web browsers can be found below.', // Paragraph 1   
//	    paragraph2: 'Just click on the icons to get to the download page', // Paragraph 2
//	    closeMessage: 'By closing this window you acknowledge that your experience on this website may be degraded', // Message displayed below closing link   
//	    closeLink: 'Close This Window', // Text for closing link   
	});
};