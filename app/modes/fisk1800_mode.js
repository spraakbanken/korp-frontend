
settings.primaryColor = "#F9D4D4";
settings.primaryLight = "#F9EDED";
//settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();


settings.corpora = {};
settings.corporafolders = {};

settings.corporafolders.bd1700 = {
	title : "Brev och dagböcker 1700-tal",
	contents : ["fsbbrev1700tal"],
	description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser."
};

settings.corporafolders.bd1800 = {
	title : "Brev och dagböcker 1800-tal",
	contents : ["fsbbrev1800tal"],
	description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser."
};

settings.corporafolders.sakprosa = {
	title : "Sakprosa",
	contents : ["sakprosa1750-1799", "sakprosa1800-1849", "sakprosa1850-1899", "sakprosa1900-1959"],
	description : ""
};

settings.corporafolders.tidskrifter = {
	title : "Tidskrifter",
	contents : ["filosofia1850-1899", "filosofia1900-1959"],
	description : ""
};

settings.corpora.fsbbrev1700tal = {
	id : "fsbbrev1700tal",
	title : "Brev 1700-tal",
	description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_sender" : {label : "sender"},
		"text_recipient" : {label : "text_recipient"},
		"text_title" : {label : "title"},
		"text_date" : {label : "date"},
		"text_source" : {label : "source"},
		"text_archivecode" : {label : "archivecode"}
	}
};

settings.corpora.fsbbrev1800tal = {
	id : "fsbbrev1800tal",
	title : "Brev 1800-tal",
	description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_sender" : {label : "sender"},
		"text_recipient" : {label : "text_recipient"},
		"text_title" : {label : "title"},
		"text_date" : {label : "date"},
		"text_source" : {label : "source"},
		"text_archivecode" : {label : "archivecode"}
	}
};

settings.corpora.fsbskonlit1800tal = {
	id : "fsbskonlit1800tal",
	title : "Skönlitteratur 1800-tal",
	description : "",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_author" : {label : "author"},
		"text_title" : {label : "title"},
		"text_date" : {label : "year"}
	}
};

settings.corpora["fsbskonlit1900-1959"] = {
	id : "fsbskonlit1900-1959",
	title : "Skönlitteratur 1900–1959",
	description : "Material ur skönlitterära verk publicerade under 1900–1959.",
	morf : 'saldom|dalinm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_author" : {label : "author"},
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_publisher" : {label : "publisher"}
	}
};

settings.corpora["filosofia1850-1899"] = {
	id : "filosofia1850-1899",
	title : "Filosofia.fi 1850–1899",
	description : "Tidskriftstexter från webbsidan filosofia.fi",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_author" : {label : "author"},
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_source" : {label : "source"},
		"text_url" : {label : "url", type : "url"}
	}
};

settings.corpora["filosofia1900-1959"] = {
	id : "filosofia1900-1959",
	title : "Filosofia.fi 1900–1959",
	description : "Tidskriftstexter från webbsidan filosofia.fi",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_author" : {label : "author"},
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_source" : {label : "source"},
		"text_url" : {label : "url", type : "url"}
	}
};

settings.corpora["sakprosa1750-1799"] = {
	id : "sakprosa1750-1799",
	title : "Sakprosa 1750–1799",
	description : "",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_author" : {label : "author"},
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_publisher" : {label : "publisher"},
		"text_url" : {label : "url", type : "url"},
		"text_pages" : {label : "page"}
	}
};

settings.corpora["sakprosa1800-1849"] = {
	id : "sakprosa1800-1849",
	title : "Sakprosa 1800–1849",
	description : "",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_author" : {label : "author"},
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_publisher" : {label : "publisher"},
		"text_url" : {label : "url", type : "url"},
		"text_pages" : {label : "page"}
	}
};

settings.corpora["sakprosa1850-1899"] = {
	id : "sakprosa1850-1899",
	title : "Sakprosa 1850–1899",
	description : "",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_author" : {label : "author"},
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_publisher" : {label : "publisher"},
		"text_url" : {label : "url", type : "url"},
		"text_pages" : {label : "page"}
	}
};

settings.corpora["sakprosa1900-1959"] = {
	id : "sakprosa1900-1959",
	title : "Sakprosa 1900–1959",
	description : "",
	morf : 'saldom|dalinm|swedbergm',
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
		"text_author" : {label : "author"},
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_publisher" : {label : "publisher"},
		"text_url" : {label : "url", type : "url"},
		"text_pages" : {label : "page"}
	}
};


settings.corpusListing = new CorpusListing(settings.corpora);
