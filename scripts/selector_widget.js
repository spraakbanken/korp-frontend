var hp_corpusChooser = {
	
	options: {
		template : ''
	},
	
	_create: function() {
//		this._super("_create");
//		$.Widget.prototype._create.call(this);
		this._transform();

		// Make the popup disappear when the user clicks outside it
		$(window).unbind('click.corpusselector');
		$(window).bind('click.corpusselector', function(e) {
			var disp = $(".popupchecks").css("display");
			if(disp != "none" && e.target != self) {
				$(".popupchecks").fadeOut('fast');
				$(".corpusInfoSpace").fadeOut('fast');
				$(".hp_topframe").removeClass("ui-corner-top");
				$(".hp_topframe").addClass("ui-corner-all");
			}
		});

		$('.buttonlink, ul#icons li').hover(
			function() { $(this).addClass('ui-state-hover'); }, 
			function() { $(this).removeClass('ui-state-hover'); }
		);




	},
	isSelected: function(id) {
		// Test if a given id is selected
		var cb = $("#"+id);
		return cb.hasClass("checked");
	},
	selectedItems: function() {
		// Return all ids that are selected
		var IDArray = new Array();
		var allboxes = $(".boxdiv label .checked");
		allboxes.each(function() {
			var idstring = $(this).attr('id');
			if (idstring != "") {
				IDArray.push(idstring.slice(9));
			}
		});
		return IDArray;
	},
	selectItems: function(item_ids) {
		item_ids = $.map(item_ids, function(item){ return "hpcorpus_"+item; })
		// Check items from outside
		var allboxes = $(".checkbox");
		allboxes.each(function() {
			/* First clear all items */
			hp_this.setStatus($(this),"unchecked");	
		});
		var realboxes = $(".boxdiv label .checkbox");
		realboxes.each(function() {
			if($.inArray($(this).attr('id'), item_ids) != -1) {
				/* Change status of item */
	 			hp_this.setStatus($(this),"checked");
	 			hp_this.updateState($(this));
	 			var ancestors = $(this).parents('.tree');
	 			ancestors.each(function(){
		 			hp_this.updateState($(this));
		 		});
			}
		});
		this.countSelected();
		// Fire callback "change":
		var callback = hp_this.options.change;
		if ($.isFunction(callback)) callback(hp_this.selectedItems());
	},
	updateState: function (element) {
			// element is a div!
			var descendants = element.find('.checkbox');
			var numbOfChecked = 0;
			var numbOfUnchecked = 0;
			descendants.each(function(){
				if (! $(this).parent().parent().hasClass("tree") ) {
					if( $(this).hasClass("checked") ) {
						numbOfChecked++;
					} else if( $(this).hasClass("unchecked") ) {
						numbOfUnchecked++;
					}
				}	
			});
			var theBox = element.children('label').children('.checkbox');
			if (numbOfUnchecked > 0 && numbOfChecked > 0) {
				this.setStatus(theBox,"intermediate"); // Intermediate
			} else if (numbOfUnchecked > 0 && numbOfChecked == 0) {
				this.setStatus(theBox,"unchecked"); // Unchecked
			} else if (numbOfChecked > 0 && numbOfUnchecked == 0) {
				this.setStatus(theBox,"checked"); // Checked
			} 
		
	},
 	setStatus: function (obj, stat) { /* Change status of item */
 			obj.removeClass("intermediate unchecked checked");
 			if(stat == "checked") {
 				obj.addClass("checked");
 				obj.attr({src : "img/checked.png"});
 			} else if(stat == "intermediate") {
 				obj.addClass("intermediate");
 				obj.attr({src : "img/intermediate.png"});
 			} else {
 				obj.addClass("unchecked");	
 				obj.attr({src : "img/unchecked.png"});
 			}
 	},
	countSelected: function () { /* Update header */
			var header_text = "";
			var header_text_2 = "";
			var checked_checkboxes = $(".hplabel .checked");
			var num_checked_checkboxes = checked_checkboxes.length;
			var num_unchecked_checkboxes = $(".hplabel .unchecked").length;
			var num_checkboxes = $(".hplabel .checkbox").length;
			if (num_unchecked_checkboxes == num_checkboxes) {
				header_text_2 = 'corpselector_noneselected';
			} else if (num_checked_checkboxes == num_checkboxes && num_checkboxes > 1) {
				header_text = num_checked_checkboxes;
				header_text_2 = 'corpselector_allselected';
			} else if (num_checked_checkboxes == 1) {
				var currentCorpusName = checked_checkboxes.parent().parent().attr('data');
				if (currentCorpusName.length > 37) { // Ellipsis
					currentCorpusName = $.trim(currentCorpusName.substr(0,37)) + "...";
				}
				header_text = currentCorpusName;
				header_text_2 = "corpselector_selectedone";
			} else {
				header_text = num_checked_checkboxes;
				header_text_2 = "corpselector_selectedmultiple";
			}
			
			// Number of tokens
			var totNumberOfTokens = 0;
            var totNumberOfSentences = 0;
			checked_checkboxes.each(function(key, corpItem) {
				//c.log(">>>>>>" + $(this).attr('id'));
				var corpusID = $(this).attr('id').slice(9);
				totNumberOfTokens += parseInt(settings.corpora[corpusID]["info"]["Size"]);
				var numSen = parseInt(settings.corpora[corpusID]["info"]["Sentences"]);
				if(!isNaN(numSen))
                    totNumberOfSentences += numSen;
			});
			
			$("#hp_corpora_title1").text(header_text);
			$("#hp_corpora_title2").attr({"rel" : 'localize[' + header_text_2 + ']'});
			$("#hp_corpora_title2").text(util.getLocaleString(header_text_2));
			$("#hp_corpora_title3").html(" — " + prettyNumbers(totNumberOfTokens.toString()) + " ").append($("<span>").localeKey("corpselector_tokens"));
            $("#sentenceCounter").html("<i>" + prettyNumbers(totNumberOfSentences.toString()) + " ").append($("<span>").localeKey("corpselector_sentences_long"));
	},
	_transform: function() {	
			var el = this.element;
			hp_this = this;
			var body;
			if(this.options.template != '') {
				body = this.options.template;
			} else {
				body = el.html();
			}
			var textoffset = -1;
			if ($.browser.webkit) {
				textoffset = -2;
			}
			
			var upper = '<div class="hp_topframe buttonlink ui-state-default ui-corner-all"><div style="float:left;margin-top:' + textoffset + 'px;"><span id="hp_corpora_title1"></span><span id="hp_corpora_title2" rel="localize[corpselector_allselected]"></span><span id="hp_corpora_title3" style="color:#888888"></span></div><div style="float:right; width:16px"><span style="text-align:right; left:auto" class="ui-icon ui-icon-triangle-2-n-s"></span></div></div></div>';
			var newHTML = '<div class="popupchecks ui-corner-bottom"><div class="header"><a href="javascript:" class="buttonlink ui-state-default ui-corner-all selectall"><span class="ui-icon ui-icon-check"></span> <span rel="localize[corpselector_buttonselectall]">' + this.options.buttonSelectAll + '</span></a> <a href="javascript:" class="selectnone buttonlink ui-state-default ui-corner-all"><span class="ui-icon ui-icon-closethick"></span> <span rel="localize[corpselector_buttonselectnone]"></span></a></div>';
			
			newHTML += recursive_transform(body,0);
			newHTML += '<br/><p style="font-size:85%" id="sentenceCounter"></p></div><div class="corpusInfoSpace ui-corner-all" style="display: none; border: 1px solid #CCCCCC; z-index: 10000; min-width: 30px; min-height: 30px; max-width: 33%; position: absolute; left:' + '442' + 'px; background-color: white; padding-right: 4px"><div class=""><p style="padding: 10px; margin: 0px"></p></div>';
			
//			el.replaceWith(newHTML);
			el.html(upper);
                        
			el.after(newHTML).addClass("scroll_checkboxes inline_block");
			var pos = $(".scroll_checkboxes").offset().left + 434;
			$(".corpusInfoSpace").css({"left": (pos.toString() + "px")});
			
			hp_this.countSelected();
			// Update the number of children for all folders:
			$(".tree").each(function() {
				var noItems = $(this).find(".hplabel .checked").length;
				$(this).children("label").children(".numberOfChildren").text("(" + noItems + ")");
			});
			
			var popoffset = $(".scroll_checkboxes").position().top + $(".scroll_checkboxes").height();
			$(".popupchecks").css({"top": popoffset-1});
			// ie7 hack
			$(".popupchecks").css({"left": $(".scroll_checkboxes").position().left});
			
			
			$(".scroll_checkboxes").unbind("mousedown");
			$(".scroll_checkboxes").mousedown(function(e) {
				c.log(".scroll_checkboxes clicked");
				$(this).disableSelection();
				if($(this).siblings(".popupchecks").css("display") == "block") {
					$(".popupchecks").fadeOut('fast');
					$(".corpusInfoSpace").fadeOut('fast');
					$(".hp_topframe").removeClass("ui-corner-top");
					$(".hp_topframe").addClass("ui-corner-all");
				} else {
					$(this).siblings(".popupchecks").css({"position":"absolute"});
					$(this).siblings(".popupchecks").css({"display":"block"});
					$(".hp_topframe").addClass("ui-corner-top");
					$(".hp_topframe").removeClass("ui-corner-all");
				}
				e.stopPropagation();
			});
			
			$(".scroll_checkboxes").unbind("click");
			$(".scroll_checkboxes").click(function(e) {
				e.stopPropagation();
			});
			
			// Prevent clicking through the box
			$(".popupchecks").unbind("click");
			$(".popupchecks").click(function(e) {
				e.stopPropagation();
			});
			
			/* SELECT ALL BUTTON */
			$(".selectall").unbind("click");
			$(".selectall").click(function() {
				var roots = $(this).parent().siblings();
				roots.each(function() {
					var check = $(this).children("label").children('.checkbox');
					hp_this.setStatus(check,"checked");
					$(this).find('.checkbox').each(function() {
						hp_this.setStatus($(this),"checked");
					});
					
				});
				hp_this.countSelected();
				// Fire callback "change":
				var callback = hp_this.options.change;
				if ($.isFunction(callback)) callback(hp_this.selectedItems());
				return false;
			});
			
			/* SELECT NONE BUTTON */
			$(".selectnone").unbind("click");
			$(".selectnone").click(function() {
				var roots = $(this).parent().siblings();
				roots.each(function() {
					var check = $(this).children("label").children('.checkbox');
					hp_this.setStatus(check,"unchecked");
					$(this).find('.checkbox').each(function() {
						hp_this.setStatus($(this),"unchecked");
					});
					
				});
				hp_this.countSelected();
				// Fire callback "change":
				var callback = hp_this.options.change;
				if ($.isFunction(callback)) callback(hp_this.selectedItems());
				return false;
			});
			
		 	$(".ext")
		 	.unbind("click")
		 	.click(function() {
		 		$(".corpusInfoSpace").fadeOut('fast');
		 		if($(this).parent().attr('class') == "tree collapsed") {
		 			$(this).parent().removeClass('collapsed');
		 			$(this).parent().addClass('extended');
		 			$(this).siblings('div').fadeToggle("fast");
		 			$(this).attr({src : "img/extended.png"});
		 		} else {
		 			$(this).parent().removeClass('extended');
		 			$(this).parent().addClass('collapsed');
		 			$(this).siblings('div').fadeToggle("fast");
		 			$(this).attr({src : "img/collapsed.png"});
		 		}
			});
			
			$(".boxlabel")
			.unbind("click") // "folders"
			.click(function() {
				hp_this.updateState($(this).parent());
	 			var childMan = $(this).children('.checkbox');
	 			if ( childMan.hasClass("checked") ) { // Checked, uncheck it if not the root of a tree
	 				if (!($(this).parent().hasClass('tree'))) {
	 					hp_this.setStatus(childMan,"unchecked");
	 				} else {
	 					var descendants = childMan.parent().siblings('div').find('.checkbox');
		 				hp_this.setStatus(descendants,"unchecked");
	 				}
	 			} else { // Unchecked, check it!
	 				hp_this.setStatus(childMan,"checked");
	 				if (($(this).parent().hasClass('tree'))) { // If tree, check all descendants
		 				descendants = childMan.parent().siblings('div').find('.checkbox');
		 				hp_this.setStatus(descendants,"checked");
	 				}
				}
				var ancestors = childMan.parents('.tree');
		 		ancestors.each(function(){
		 			hp_this.updateState($(this));
		 		});
		 		hp_this.countSelected();
		 		// Fire callback "change":
				var callback = hp_this.options.change;
				if ($.isFunction(callback)) callback(hp_this.selectedItems());
 			});
 			
 			var hoverConfig = {    
     			over: function() {
     				// Fire callback "infoPopup":
					var callback = hp_this.options.infoPopup;
					var returnValue = "";
					var inValue = "";
					var idstring = $(this).find("img").attr("id")
					if (idstring != "") {
						inValue = idstring.slice(9);
					}
					if ($.isFunction(callback)) returnValue = callback(inValue);
 					$(".corpusInfoSpace").css({"top": $(this).offset().top});
 					$(".corpusInfoSpace").find("p").html(returnValue);
 					$(".corpusInfoSpace").fadeIn('fast');
 					//$(".corpusInfoSpace").css({"display": "block"});
 				},  
     			interval: 200, // number = milliseconds delay before onMouseOut    
     			out: function() {
 					/*$(".corpusInfoSpace").fadeOut('fast');
 					//$(".corpusInfoSpace").css({"display": "none"});*/
 				}
			};
			
			var hoverFolderConfig = {
				over: function() {
					var callback = hp_this.options.infoPopupFolder;
					var returnValue = "";
					var indata = [];
					var boxes = $(this).find(".boxdiv")
					var corpusID = [];
					boxes.each(function(index) {
						corpusID.push($(this).find("img").attr('id').slice(9));
					});
					indata["corporaID"] = corpusID;
					var desc = $(this).attr("data").split("___")[1];
					if(!desc) {
						desc = "";
					}
					indata["description"] = desc;
					indata["title"] = $(this).attr("data").split("___")[0];
					if ($.isFunction(callback)) returnValue = callback(indata);
					$(".corpusInfoSpace").css({"top": $(this).offset().top});
 					$(".corpusInfoSpace").find("p").html(returnValue);
 					$(".corpusInfoSpace").fadeIn('fast');
				},
				interval: 200,
				out: function() {}
			};

 			$(".boxdiv").hoverIntent(hoverConfig);
 			$(".tree").hoverIntent(hoverFolderConfig);
 			
 			$(".boxdiv").unbind("click"); // "Non-folder items"
			$(".boxdiv").click(function() {
				$(this).disableSelection();
				hp_this.updateState($(this));
	 			var childMan = $(this).children('label').children('.checkbox');
				if ( childMan.hasClass("checked") ) {
					hp_this.setStatus(childMan,"unchecked");
				} else {
					hp_this.setStatus(childMan,"checked");
				}			
				var ancestors = childMan.parents('.tree');
		 		ancestors.each(function(){
		 			hp_this.updateState($(this));
		 		});
		 		hp_this.countSelected();
				// Fire callback "change":
				var callback = hp_this.options.change;
				if ($.isFunction(callback)) callback(hp_this.selectedItems());
 			});
		
		function recursive_transform(einHTML, levelindent) {
			var outStr = "";
			var ul = $(einHTML).children();
			var hasDirectCorporaChildren = false;
			ul = ul.each(function(index){
				var theHTML = $(this).html();
				if(theHTML != null) {
					var leftattrib = 0;
					var item_id = $(this).attr('id');
					if(item_id == null)
						item_id = "";
					if(item_id != "")
						item_id = "hpcorpus_" + item_id;

					if(theHTML.indexOf("<li") != -1 || theHTML.indexOf("<LI") != -1 ) {
						var cssattrib = "";
						leftattrib = 30*Math.min(1,levelindent);
						if(levelindent > 0) {
							cssattrib = "; display:none";
						}
						var foldertitle = $(this).children('ul').attr('title');
						var folderdescription = $(this).children('ul').attr('description');
						if(folderdescription == "undefined")
							folderdescription = "";
						outStr += '<div data="' + foldertitle + "___" + folderdescription + '" style="margin-left:' + leftattrib + 'px;' + cssattrib + '" class="tree collapsed"><img src="img/collapsed.png" alt="extend" class="ext"/> <label class="boxlabel"><img id="' + item_id + '" class="checkbox checked" src="img/checked.png" /> <span>' + foldertitle + ' </span><span class="numberOfChildren">(?)</span></label>';
						
						outStr += recursive_transform(theHTML, levelindent+1);
						outStr += "</div>";
					} else {
						if(levelindent > 0) {
							// Indragna och gömda per default
							hasDirectCorporaChildren = true
							outStr += '<div data="' + theHTML + '" class="boxdiv ui-corner-all" style="margin-left:46px; display:none; background-color:' + settings.primaryColor + '"><label class="hplabel"><img id="' + item_id + '" class="checkbox checked" src="img/checked.png" /> ' + theHTML + ' </label></div>';
						} else {
							if (index != ul.size()) {
								hasDirectCorporaChildren = true
								outStr += '<div data="' + theHTML + '" class="boxdiv ui-corner-all" style="margin-left:16px; background-color:' + settings.primaryColor + '"><label class="hplabel"><img id="' + item_id + '" class="checkbox checked" src="img/checked.png"/> ' + theHTML + ' </label></div>';
							}
						}
					}
				}
	
			});
			if (!hasDirectCorporaChildren) {
				outStr += '<div class="extra_fill" style="height:2px; display:none; visible:false"></div>';
			}

			return outStr;
		}

	}
}

$.widget("hp.corpusChooser", hp_corpusChooser); // create the widget


