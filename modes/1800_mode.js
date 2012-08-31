
settings.primaryColor = "#F9D4D4";
settings.primaryLight = "#F9EDED";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();


settings.corpora = {};
settings.corporafolders = {};


settings.corpora.bibel1917 = {
	id : "bibel1917",
	title : "Bibeln 1917",
	description : "",
	within : within.defaultStruct,
	attributes : {
		pos : attrs.pos,
		msd : attrs.msd,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		saldo : attrs.saldo,
		prefix : attrs.prefix,
		suffix : attrs.suffix,
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref,
	},
	struct_attributes : {
		"text_title" : {
			label : "title"
		},
                "paragraph_chap" : {label : "chapter"},
                "verse_n" : {label : "verse"},
		"text_datefrom" : {
			label : "year_from"
		},
		"text_dateto" : {
			label : "year_to"
		}
	}
};

settings.corpora.bibel1873 = {
	id : "bibel1873",
	title : "Bibeln 1873",
	description : "",
    within : within.defaultStruct,
	attributes : {
		pos : attrs.pos,
		msd : attrs.msd,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		saldo : attrs.saldo,
		prefix : attrs.prefix,
		suffix : attrs.suffix,
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref
	},
	struct_attributes : {
		"text_title" : {
			label : "title"
		},
        "paragraph_chap" : {label : "chapter"},
		"text_datefrom" : {
			label : "year_from"
		},
		"text_dateto" : {
			label : "year_to"
		}
	}
};
settings.corpora.bibel1873dalin = {
	id : "bibel1873dalin",
	title : "Bibeln 1873 (Dalin)",
	description : "Annoterad med Dalin",
	within : within.defaultStruct,
	attributes : {
		pos : attrs.pos,
		msd : attrs.msd,
		lemma    : attrs.baseform,
		dalinlem : {label : "lemgram",
                            type  : "set"},
		saldolem : {label : "modern",
                            type  : "set"},
		prefix : attrs.prefix,
		suffix : attrs.suffix,
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref
		
	},
	struct_attributes : {
		"text_title" : {
			label : "title"
		},
        "paragraph_chap" : {label : "chapter"},
		"text_datefrom" : {
			label : "year_from"
		},
		"text_dateto" : {
			label : "year_to"
		},
		"verse_n" : {label : "verse"}
	}
};


settings.corpusListing = new CorpusListing(settings.corpora);