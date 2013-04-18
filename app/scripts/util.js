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
		c.error("Locale string cannot be found because no data file has been read.");
		return;
	}
	var output = $.localize.data.locale[key] || $.localize.data.corpora[key];
	if(output == null && key != null)
		return key;
//		$.error("Could not find translation key " + key);
	return output;
};
util.initLocalize = function() {
	return $.localize("init", {
		packages : ["locale", "corpora"],
		pathPrefix : "translations",
		language : $.bbq.getState("lang") || settings.defaultLanguage,
		callback : function() {
			if(this.is(".num_hits")) {
				var selected = this.find("option:selected");
				c.log("selected", selected, util.getLocaleString(this.data("prefix")) + ": " + selected.text());
				selected.text(util.getLocaleString(this.data("prefix")) + ": " + selected.text());
			}
			this.find("[data-placeholder]").add(this.filter("[data-placeholder]")).each(function() {
				$(this).attr("placeholder", util.getLocaleString($(this).data("placeholder")));
			});
		}
	});
};
//TODO: get rid of this
util.localize = function(root) {
	root = root || "body"; 
	$(root).localize();
};

util.lemgramToString = function(lemgram, appendIndex) {
	var infixIndex = "";
	if(util.isLemgramId(lemgram)) {
		var match = util.splitLemgram(lemgram);
		if(appendIndex != null && match.index != "1") {
			infixIndex = $.format("<sup>%s</sup>", match.index);
		}
		var concept = match.form.replace(/_/g, " ");
		var type = match.pos.slice(0, 2);
	}
	else { // missing from saldo, and has the form word_NN instead.
		var concept = "";
		var type = "";
		try {
			 concept = lemgram.split("_")[0];
			 type = lemgram.split("_")[1].toLowerCase();
		} catch(e) {
			c.log("lemgramToString broken for ", lemgram);
		}
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
	var keys = ["morph", "form", "pos", "index", "startIndex"];
	var splitArray = lemgram.match(/((\w+)--)?(.*?)\.\.(\w+)\.(\d\d?)(\:\d+)?$/).slice(2);
	
	return _.object(keys, splitArray);
};

util.splitSaldo = function(saldo) {
	return saldo.match(util.saldoRegExp);
};

util.setJsonLink = function(settings){
	if(settings == null) {
		c.log("failed to update json link");
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
				if (added_corpora_ids[usedid] == val || settings.corpora[val].hide) {
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

util.formatDecimalString = function(x, mode, statsmode) { // Use "," instead of "." if Swedish, if mode is
	// Split the string into two parts
	if(_.contains(x, ".")) {
    	var parts = x.split(".");
    	var decimalSeparator = util.getLocaleString("util_decimalseparator");
    	if(mode)
    		return prettyNumbers(parts[0]) + '<span rel="localize[util_decimalseparator]">' + decimalSeparator + '</span>' + parts[1];
    		//return x.replace(".",'<span rel="localize[util_decimalseparator]">' + decimalSeparator + '</span>');
    	else
    		return prettyNumbers(parts[0]) + decimalSeparator + parts[1];
    		//return x.replace(".", decimalSeparator);
	} else {
	    if(statsmode) {
	       return x;
	    } else {
	       return prettyNumbers(x);
	    }
	}
};


/* Helper function to turn "8455999" into "8 455 999" */
function prettyNumbers(numstring) {
	var regex = /(\d+)(\d{3})/;
	var outStrNum = numstring.toString();
  	while (regex.test(outStrNum)) {
    	outStrNum = outStrNum.replace(regex, '$1' + '<span rel="localize[util_numbergroupseparator]">' + util.getLocaleString("util_numbergroupseparator") + '</span>' + '$2');
  	}
  	return outStrNum;
}

/* Goes through the settings.corporafolders and recursively adds the settings.corpora hierarchically to the corpus chooser widget */
function loadCorpora() {
	added_corpora_ids = [];
	var outStr = loadCorporaFolderRecursive(true, settings.corporafolders);
	corpusChooserInstance = $('#corpusbox')
	.corpusChooser({
		template: outStr, 
	    infoPopup: function(corpusID) {
	    	var corpusObj = settings.corpora[corpusID];
	    	var maybeInfo = "";
	    	if(corpusObj.description)
	    		maybeInfo = "<br/><br/>" + corpusObj.description;
	    	var numTokens = corpusObj["info"]["Size"];
	    	var numSentences = corpusObj["info"]["Sentences"];
	    	var lastUpdate = corpusObj["info"]["Updated"];
	    	if (!lastUpdate) {
	       	    lastUpdate = "?";
	    	}
	    	var sentenceString = "-";
	    	if (numSentences)
	    		sentenceString = prettyNumbers(numSentences.toString());
	    	var output = '<b><img src="img/korp_icon.png" style="margin-right:4px; width:24px; height:24px; vertical-align:middle; margin-top:-1px"/>' +
	    	corpusObj.title + "</b>" + maybeInfo + "<br/><br/>" + util.getLocaleString("corpselector_numberoftokens") + 
	    	": <b>" + prettyNumbers(numTokens) + "</b><br/>" + util.getLocaleString("corpselector_numberofsentences") + ": <b>" + sentenceString + 
	    	"</b><br/>" + util.getLocaleString("corpselector_lastupdate") + ": <b>" + lastUpdate + "</b><br/><br/>";
	    	
	    	var supportsContext = _.keys(corpusObj.context).length > 1;
	    	if(supportsContext)
	    		output += $("<div>").localeKey("corpselector_supports").html();
	    	
	    	if(corpusObj.limited_access)
	    		output += $("<div>").localeKey("corpselector_limited").html();
	    	
	    	return output;
	    	
	    	
	    	
	    }, 
	    infoPopupFolder: function(indata) {
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
	    	return '<b><img src="img/folder.png" style="margin-right:4px; vertical-align:middle; margin-top:-1px"/>' + indata.title + 
	    	"</b><br/><br/>" + maybeInfo + "<b>" + corporaID.length + "</b> " + glueString + ":<br/><br/><b>" + prettyNumbers(totalTokens.toString()) + 
	    	"</b> " + util.getLocaleString("corpselector_tokens") + "<br/><b>" + totalSentencesString + "</b> " + util.getLocaleString("corpselector_sentences");
	    }
    }).bind("corpuschooserchange", function(evt, corpora) {
    	c.log("corpuschooserchange", corpora)
    	// c.log("corpus changed", corpora);
		settings.corpusListing.select(corpora);
		// if(_.keys(corpora).length < _.keys(settings.corpora).length) {
		// 	$.bbq.pushState({"corpus" : corpora.join(",")});
		// }
		var nonprotected = _.pluck(settings.corpusListing.getNonProtected(), "id")
		if(corpora.length && _.intersection(corpora, nonprotected).length != nonprotected.length) {
	        $.bbq.pushState({"corpus" : corpora.join(",")})
	        // search({"corpus" : corpora.join(",")})
		} else {
	        $.bbq.removeState("corpus")
		}
		if(corpora.length) {
			if(currentMode == "parallel")
				extendedSearch.reset();
			else 
				extendedSearch.refreshTokens();
			view.updateReduceSelect();
			view.updateContextSelect("within");
//			view.updateContextSelect("context");
		}
		var enableSearch = !!corpora.length;
		view.enableSearch(enableSearch);
    });
	settings.corpusListing.select(corpusChooserInstance.corpusChooser("selectedItems"));
}


util.makeAttrSelect = function(groups) {
	var arg_select = $("<select/>");
	$.each(groups, function(lbl, group) {
		if($.isEmptyObject(group)) {
			return;
		}
		var optgroup = $("<optgroup/>", {label : util.getLocaleString(lbl).toLowerCase(), "rel" : $.format("localize[%s]", lbl)})
		.appendTo(arg_select);
		$.each(group, function(key, val) {
			if(val.displayType == "hidden")
				return;
			
			$('<option/>',{rel : $.format("localize[%s]", val.label)})
			.val(key).text(util.getLocaleString(val.label) || "")
			.appendTo(optgroup)
			.data("dataProvider", val);

		});
	});
	return arg_select;
};

function regescape(s) {
    return s.replace(/[\.|\?|\+|\*|\|\'|\"\(\)\^\$]/g, "\\$&");
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
	    paragraph1: 'Korp använder sig av moderna webbteknologier som inte stödjs av din webbläsare. En lista på de mest populära moderna alternativen visas nedan. Firefox rekommenderas varmt.', // Paragraph 1   
	    paragraph2: '', // Paragraph 2
	    closeMessage: 'Du kan fortsätta ändå – all funktionalitet är densamma – men så fort du önskar att Korp vore snyggare och snabbare är det bara att installera Firefox, det tar bara en minut.', // Message displayed below closing link   
	    closeLink: 'Stäng varningen', // Text for closing link   
//		header: 'Did you know that your Internet Browser is out of date?', // Header of pop-up window   
//	    paragraph1: 'Your browser is out of date, and may not be compatible with our website. A list of the most popular web browsers can be found below.', // Paragraph 1   
//	    paragraph2: 'Just click on the icons to get to the download page', // Paragraph 2
//	    closeMessage: 'By closing this window you acknowledge that your experience on this website may be degraded', // Message displayed below closing link   
//	    closeLink: 'Close This Window', // Text for closing link
    	closeCookie: true, // If cookies should be used to remmember if the window was closed (see cookieSettings for more options)   
        // Cookie settings are only used if closeCookie is true   
        cookieSettings: {   
            path: '/', // Path for the cookie to be saved on (should be root domain in most cases)   
            expires: 100000 // Expiration Date (in seconds), 0 (default) means it ends with the current session   
        }   
	});
};
// singleton for getting colors. use syntax util.colors.getNext()
util.colors = function() {
	util.colors = this;
	this.c = ["color_blue","color_purple","color_green","color_yellow","color_azure","color_red"];
	this.n = -1;
	this.getNext = function() {
		return this.c[++this.n % this.c.length];
	};
};
util.colors();

//from http://plugins.jquery.com/files/jquery.color.js.txt
//Parse strings looking for color tuples [255,255,255]
util.getRGB = function(color) {
	var result;

	// Check if we're already dealing with an array of colors
	if ( color && color.constructor == Array && color.length == 3 )
		return color;

	// Look for rgb(num,num,num)
	if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
		return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

	// Look for rgb(num%,num%,num%)
	if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
		return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

	// Look for #a0b1c2
	if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
		return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

	// Look for #fff
	if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
		return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

	// Otherwise, we're most likely dealing with a named color
	return colors[jQuery.trim(color).toLowerCase()];
};

util.changeColor = function(rgbstr, incr) {
	var rgb = util.getRGB(rgbstr);
    for(var i = 0; i < rgb.length; i++){
        rgb[i] = Math.max(0, Math.min(rgb[i] + incr, 255));
    }
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
};


util.setLogin = function() {
	c.log("login success");
	$("body").toggleClass("logged_in not_logged_in");
	$.each(authenticationProxy.loginObj.credentials, function(i, item) {
		$($.format("#hpcorpus_%s", item.toLowerCase())).closest(".boxdiv.disabled").removeClass("disabled");
	});
	$("#log_out .usrname").text(authenticationProxy.loginObj.name);
	$(".err_msg", self).hide();
};



util.convertLMFFeatsToObjects = function(structure, key) {
	   // Recursively traverse a tree, expanding each "feat" array into a real object, with the key "feat-[att]":

	   if(structure != null) {
	       var output = null;

	       var theType = util.findoutType(structure);
	       if( theType == "object" ) {
	           output = {}

	           $.each(structure, function(inkey, inval) {
	               if( inkey == "feat" ) {

	                   var innerType = util.findoutType(inval);

	                   if( innerType == "array" ) {
	                       $.each(inval, function(fkey, fval) {
	                           var keyName = "feat_" + fval["att"];
	                           if( output[keyName] === undefined ) {
	                               output[keyName] = fval["val"];
	                           } else {
	                               if( $.isArray(output[keyName]) ) {
	                                   output[keyName].push(fval["val"]);
	                               } else {
	                                   var dummy = output[keyName];
	                                   output[keyName] = new Array();
	                                   output[keyName].push(dummy);
	                                   output[keyName].push(fval["val"]);
	                               }
	                           }
	                       });
	                   } else {
	                       var keyName = "feat_" + inval["att"];
	                       if( output[keyName] === undefined ) {
	                           output[keyName] = inval["val"];
	                       } else {
	                           if( $.isArray(output[keyName]) ) {
	                               output[keyName].push(inval["val"]);
	                           } else {
	                               var dummy = output[keyName];
	                               output[keyName] = new Array();
	                               output[keyName].push(dummy);
	                               output[keyName].push(inval["val"]);
	                           }
	                       }
	                   }

	               } else {
	                   output[inkey] = util.convertLMFFeatsToObjects(inval);
	               }
	           });

	       } else if( theType == "array" ) {
	           var dArr = new Array();
	           $.each(structure, function(inkey, inval) {
	               dArr.push(util.convertLMFFeatsToObjects(inval));
	           });
	           output = dArr;
	       } else {
	           output = structure;
	       }

	       return output;
	   } else {
	       return null;
	   }
	}

util.findoutType = function(variable) {
	   if( $.isArray(variable) ) {
	       return "array";
	   } else {
	       return typeof(variable);
	   }
	};