settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora["pe77"] = {
	id : "pe77",
	lang : "spa",
	title: "Spanska presstexter",
	context: settings.defaultContext,
	within : settings.defaultWithin,
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"}
	},
	struct_attributes : {
		text_title : {label : "title"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"spa" : "spanish"
			}
		}
	}
};

settings.corpora["one71"] = {
	id : "one71",
	lang : "spa",
	title: "Spanska noveller",
	context: settings.defaultContext,
	within : settings.defaultWithin,
	attributes: {
		pos: {label : "pos"},
		lemma: {label : "baseform"}
	},
	struct_attributes : {
		text_title : {label : "title"},
		text_lang : {
			label : "lang",
			displayType : "select",
			extended_template : selectType.extended_template,
			controller : selectType.controller,
			dataset: {
				"spa" : "spanish"
			}
		}
	}
};


settings.corpusListing = new CorpusListing(settings.corpora);