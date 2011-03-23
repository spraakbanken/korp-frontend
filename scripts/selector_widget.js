var hp_corpusChooser = {
	
	options: {
		template : '',
		allSelectedString : 'All corpora selected',
		noneSelectedString : 'No corpus selected',
		selectedString : ' selected',
		selectedMultipleString: ' corpuses selected',
		buttonSelectAll : 'Select all',
		buttonSelectNone : 'Select none'
	},
	
	_create: function() {
			this._transform();
			
			// Make the popup disappear when the user clicks outside it
			$(window).unbind('click.korpen2');
			$(window).bind('click.korpen2', function(e) {
				var disp = $(".popupchecks").css("display");
				if(disp != "none" && e.target != self) {
					$(".popupchecks").fadeOut('fast');
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
		//var cb = item.find("checkbox");
		return cb.hasClass("checked");
	},
	selectedItems: function() {
		// Return all ids that are selected
		var IDArray = new Array();
		var allboxes = $(".boxdiv label .checked");
		allboxes.each(function(){
			var idstring = $(this).attr('id');
			//alert(idstring);
			IDArray.push(idstring.slice(9));
		});
		//alert(allboxes.length);
		return IDArray;
	},
	_transform: function() {	
			var el = this.element;
			var body;
			if(this.options.template != '') {
				body = this.options.template;
			} else {
				body = el.html();
			}
			var newHTML = '<div class="scroll_checkboxes">';
			newHTML += '<div class="hp_topframe buttonlink ui-state-default ui-corner-all"><div style="float:left"><span id="hp_corpora_title">' + this.options.allSelectedString + '</span></div><div style="float:right; width:16px"><span style="text-align:right; left:auto" class="ui-icon ui-icon-triangle-2-n-s"></span></div></div></div>';
			
			newHTML += '<div class="popupchecks ui-corner-bottom">'
			
			newHTML += '<p style="text-align:right; margin-top:10px; margin-right:8px"><a href="#" class="buttonlink ui-state-default ui-corner-all selectall"><span class="ui-icon ui-icon-check"></span> ' + this.options.buttonSelectAll + '</a> <a href="#" class="selectnone buttonlink ui-state-default ui-corner-all"><span class="ui-icon ui-icon-closethick"></span> ' + this.options.buttonSelectNone + '</a></p>';
			
			newHTML += recursive_transform(body,0);
			newHTML += '</div>';
			el.replaceWith(newHTML);
			
			//var popoffset = $(".scroll_checkboxes").position().top + $(".hp_topframe").css("height");
			var popoffset = $(".scroll_checkboxes").position().top + 2;
			$(".popupchecks").css({"top": popoffset});
			
			// Save the strings in the options of the UI object in the grand parent JQuery object
			$(".scroll_checkboxes").data('allSelectedString',this.options.allSelectedString);
			$(".scroll_checkboxes").data('noneSelectedString',this.options.noneSelectedString);
			$(".scroll_checkboxes").data('selectedString',this.options.selectedString);
			$(".scroll_checkboxes").data('selectedMultipleString',this.options.selectedMultipleString);
			
			$(".scroll_checkboxes").unbind("mousedown");
			$(".scroll_checkboxes").mousedown(function(e) {
				$(this).disableSelection();
				if($(this).siblings(".popupchecks").css("display") == "block") {
					$(".popupchecks").fadeOut('fast');
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
					setStatus(check,"checked");
					$(this).find('.checkbox').each(function() {
						setStatus($(this),"checked");
					});
					
				});
				countSelected();
			});
			
			/* SELECT NONE BUTTON */
			$(".selectnone").unbind("click");
			$(".selectnone").click(function() {
				var roots = $(this).parent().siblings();
				roots.each(function() {
					var check = $(this).children("label").children('.checkbox');
					setStatus(check,"unchecked");
					$(this).find('.checkbox').each(function() {
						setStatus($(this),"unchecked");
					});
					
				});
				countSelected();
			});
			
		 	$(".ext").unbind("click");
		 	$(".ext").click(function() {
		 		if($(this).parent().attr('class') == "tree collapsed") {
		 			$(this).parent().removeClass('collapsed');
		 			$(this).parent().addClass('extended');
		 			$(this).siblings('div').fadeToggle("fast");
		 			$(this).attr({src : "img/extended.png"});
		 			//$(this).siblings('img').attr({src : "img/folderopen.png"});
		 		} else {
		 			$(this).parent().removeClass('extended');
		 			$(this).parent().addClass('collapsed');
		 			$(this).siblings('div').fadeToggle("fast");
		 			$(this).attr({src : "img/collapsed.png"});
		 			//$(this).siblings('.extright').attr({src : "img/folder.png"});
		 		}
			});
			
			/*$(".extright").unbind("click");
		 	$(".extright").click(function() {
		 		if($(this).parent().attr('class') == "tree collapsed") {
		 			$(this).parent().removeClass('collapsed');
		 			$(this).parent().addClass('extended');
		 			$(this).siblings('div').fadeToggle("fast");
		 			$(this).siblings('.ext').attr({src : "img/extended.png"});
		 			//$(this).attr({src : "img/folderopen.png"});
		 		} else {
		 			$(this).parent().removeClass('extended');
		 			$(this).parent().addClass('collapsed');
		 			$(this).siblings('div').fadeToggle("fast");
		 			$(this).siblings('.ext').attr({src : "img/collapsed.png"});
		 			//$(this).attr({src : "img/folder.png"});
		 		}
			});*/
			
			$(".boxlabel").unbind("click"); // "folders"
			$(".boxlabel").click(function() {
				updateState($(this).parent());
	 			var childMan = $(this).children('.checkbox');
	 			if ( childMan.hasClass("checked") ) { // Checked, uncheck it if not the root of a tree
	 				if (!($(this).parent().hasClass('tree'))) {
	 					setStatus(childMan,"unchecked");
	 				} else {
	 					var descendants = childMan.parent().siblings('div').find('.checkbox');
		 				setStatus(descendants,"unchecked");
	 				}
	 			} else { // Unchecked, check it!
	 				setStatus(childMan,"checked");
	 				if (($(this).parent().hasClass('tree'))) { // If tree, check all descendants
		 				var descendants = childMan.parent().siblings('div').find('.checkbox');
		 				setStatus(descendants,"checked");
	 				}
				}
				var ancestors = childMan.parents('.tree');
		 		ancestors.each(function(){
		 			updateState($(this));
		 		});
		 		countSelected();
 			});
 			
 			$(".boxdiv").unbind("click"); // "Non-folder items"
			$(".boxdiv").click(function() {
				$(this).disableSelection();
				updateState($(this));
	 			var childMan = $(this).children('label').children('.checkbox');
				if ( childMan.hasClass("checked") ) {
					setStatus(childMan,"unchecked");
				} else {
					setStatus(childMan,"checked");
				}			
				var ancestors = childMan.parents('.tree');
		 		ancestors.each(function(){
		 			updateState($(this));
		 		});
		 		countSelected();
 			});
 			
 		/* Change status of item */
 		function setStatus(obj, stat) {
 			obj.removeClass("intermediate");
 			obj.removeClass("unchecked");
 			obj.removeClass("checked");
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
 		}
		
		/* Update header */
		function countSelected() {
			var header_text = "";
			var checked_checkboxes = $(".hplabel .checked");
			var num_checked_checkboxes = checked_checkboxes.length;
			var num_unchecked_checkboxes = $(".hplabel .unchecked").length;
			var num_checkboxes = $(".hplabel .checkbox").length;
			if (num_unchecked_checkboxes == num_checkboxes) {
				header_text = $('.scroll_checkboxes').data('noneSelectedString');
			} else if (num_checked_checkboxes == num_checkboxes) {
				header_text = $('.scroll_checkboxes').data('allSelectedString');
			} else if (num_checked_checkboxes == 1) {
				var currentCorpusName = checked_checkboxes.parent().parent().attr('title');
				if (currentCorpusName.length > 37) { // Ellipsis
					currentCorpusName = $.trim(currentCorpusName.substr(0,37)) + "...";
				}
				header_text = currentCorpusName + $('.scroll_checkboxes').data('selectedString');
			} else {
				header_text = num_checked_checkboxes + $('.scroll_checkboxes').data('selectedMultipleString');
			}
			$("#hp_corpora_title").text(header_text);
		}
		
		function updateState(element) {
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
				setStatus(theBox,"intermediate"); // Intermediate
			} else if (numbOfUnchecked > 0 && numbOfChecked == 0) {
				setStatus(theBox,"unchecked"); // Unchecked
			} else if (numbOfChecked > 0 && numbOfUnchecked == 0) {
				setStatus(theBox,"checked"); // Checked
			} 
		}
		
		
		function recursive_transform(einHTML, levelindent) {
			var outStr = "";
			var ul = $(einHTML).children();
			ul = ul.each(function(index){
				var theHTML = $(this).html();
				if(theHTML != null) {
					var leftattrib = 0;
					var item_id = $(this).attr('id');
					if(item_id == null)
						item_id = "";
					if(item_id != "")
						item_id = "hpcorpus_" + item_id;
					//alert(item_id);
					if(theHTML.indexOf("<li") != -1 || theHTML.indexOf("<LI") != -1 ) {
						var cssattrib = "";
						leftattrib = 30*Math.min(1,levelindent);
						if(levelindent > 0) {
							cssattrib = "; display:none";
						}
						var foldertitle = $(this).children('ul').attr('title');
						outStr += '<div title="' + foldertitle + '" style="left:' + leftattrib + 'px;' + cssattrib + '" class="tree collapsed"><img src="img/collapsed.png" alt="extend" class="ext"/> <label class="boxlabel"><img id="' + item_id + '" class="checkbox checked" src="img/checked.png" /> <span>' + foldertitle + '</span></label>';
						
						outStr += recursive_transform(theHTML, levelindent+1);
						outStr += "</div>";
					} else {
						if(levelindent > 0) {
							// Indragna och gömda per default
							outStr += '<div title="' + theHTML + '" class="boxdiv" style="width:' + (330-levelindent*30) + 'px; visible:false; left:46px; display:none"><label class="hplabel"><img id="' + item_id + '" class="checkbox checked" src="img/checked.png" /> ' + theHTML + ' </label></div>';
						} else {
							if (index != ul.size()) {
								outStr += '<div title="' + theHTML + '" class="boxdiv" style="width:330px; left:16px"><label class="hplabel"><img id="' + item_id + '" class="checkbox checked" src="img/checked.png"/> ' + theHTML + ' </label></div>';
							}
						}
					}
				}
	
			});

			return outStr;
		};
	}
}

$.widget("hp.corpusChooser", hp_corpusChooser); // create the widget


	



