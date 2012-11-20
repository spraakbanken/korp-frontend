
settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
//settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;


$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora["digidaily"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily",
	title : "Digidaily",
	description : "",
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
		lemma : attrs.baseform,
		pos : attrs.pos,
		lex : attrs.lemgram,
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref,
		saldo : attrs.saldo,
		prefix : attrs.prefix,
		suffix : attrs.suffix
	},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Dalpilen",
				"Gotlands tidning",
 				"Faluposten",
 				"Fahlu weckoblad",
 				"Folkets röst",
 				"Bollnäs tidning",
			        ],
            opts : settings.liteOptions

		},
	
		text_date : {label : "date"}
	//	text_edition : {label : "edition"}
	}
};



settings.corpusListing = new CorpusListing(settings.corpora);

function getAnnotationRank(anno) {
	return {
		"word" : 1,
		"gf" : 2,
		"lemgram" : 3,
		"sense" : 4
	}[anno] || 5;
}

