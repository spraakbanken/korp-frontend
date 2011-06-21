var ParallelExtendedSearch = {
	Extends : view.ExtendedSearch,
	initialize : function(mainDivId) {
		this.parent(mainDivId);
//		this.$main.prepend("<i>This is the parallel view.</i>");
	}
};

var ParallelKWICResults = {
	Extends : view.KWICResults,
	
	onWordClick : function(word, sentence) {
		var data = word.tmplItem().data;
		var currentSentence = sentence.aligned;  
		var i = Number(data.dephead);
		var aux = $(word.closest("tr").find(".word").get(i - 1));
		util.SelectionManager.select(word, aux);
		updateSidebar(currentSentence.structs, data, sentence.corpus);
	}
	
};

view.ExtendedSearch = new Class(ParallelExtendedSearch);
view.KWICResults = new Class(ParallelKWICResults);


settings.primaryColor = "#FFF3D8";
settings.corporafolders = {};
settings.corporafolders.salt = {
	title : "SALT",
	contents : ["saltnld_swe"]
};

//settings.corpora.saltnld = {
settings.corpora = {};
settings.corpora.saltnld_swe = {
	title: "Svenska-nederländska", 
	languages : { 
		SALTNLD_SWE: "svenska", 
		SALTNLD_NLD: "nederländska"
	}, 
	context: context.defaultAligned, 
	within: {
		"link": "meningspar"
	}, 
	attributes: {
		pos: attrs.pos, 
		msd: attrs.msd, 
		lemma: attrs.baseform,
		lex: attrs.lemgram, 
		saldo: attrs.saldo, 
		dephead: attrs.dephead, 
		deprel: attrs.deprel, 
		ref: attrs.ref, 
		link: attrs.link, 
		text: attrs.text
	},
	struct_attributes : {
//		text_origlang : {
//			label : "original_language"
//		}
	}
};