function SelectionManager() {
	$.error("SelectionManager is a static class, don't instantiate it.");
}


SelectionManager.select = function(word) {
	
	if(SelectionManager.selected) {
		SelectionManager.selected.removeClass("token_selected");
	}
		
	SelectionManager.selected = word;
	word.addClass("token_selected");
};

SelectionManager.deselect = function() {
	if(!SelectionManager.selected) return;
	SelectionManager.selected.removeClass("token_selected");
	SelectionManager.selected = null;
};