
settings.primaryColor = "#eecccc";
settings.primaryLight = "#eee2e2";
settings.autocomplete = true;
settings.lemgramSelect = true;
settings.wordpicture = true;

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.lb = {
	id : "lb",
	title : "Litteraturbanken",
	description : 'Samtliga etexter och sökbara faksimiler från <a href="http://litteraturbanken.se/">Litteraturbanken.se</a>.',
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {
		pos : attrs.pos,
		msd : attrs.msd,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		saldo : attrs.saldo,
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref,
		prefix : attrs.prefix,
		suffix : attrs.suffix
	},
	struct_attributes : {
		"text_title" : {label : "title"},
		"text_author" : {label : "author"},
		"text_url" : {label : "verk", type : "url"},
		"text_source" : {label : "source"},
		"text_date" : {label : "imprintyear"},
		"page_n" : {label : "page"},
		"page_url" : {label : "pagelink", type : "url"}
	}
};

settings.corpusListing = new CorpusListing(settings.corpora);
