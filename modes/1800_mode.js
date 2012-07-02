
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
	title : "Bibeln 1917",
	description : "",
	languages : {
		BIBEL1917 : "svenska"
	},
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
		},
	}
};

settings.corpora.bibel1873 = {
	title : "Bibeln 1873",
	description : "",
	languages : {
		BIBEL1873 : "svenska"
	},
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
		"text_datefrom" : {
			label : "year_from"
		},
		"text_dateto" : {
			label : "year_to"
		},
	}
};
settings.corpora.bibel1873dalin = {
	title : "Bibeln 1873 (Dalin)",
	description : "Annoterad med Dalin",
	languages : {
		BIBEL1873DALIN : "svenska"
	},
	within : within.defaultStruct,
	attributes : {
		pos : attrs.pos,
		msd : attrs.msd,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref,
		saldo : {
			label : "modern",
			type : "set",
			opts : settings.liteOptions
		}
		
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
	}
};


