
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

settings.corpusListing = new CorpusListing(settings.corpora);
