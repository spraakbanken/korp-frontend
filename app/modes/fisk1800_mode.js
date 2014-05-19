
settings.primaryColor = "#F9D4D4";
settings.primaryLight = "#F9EDED";
//settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
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
	contents : ["fsbbrev1800-1849", "fsbbrev1850-1899"],
	description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser."
};

settings.corporafolders.bd1900 = {
	title : "Brev och dagböcker 1900-tal",
	contents : ["fsbbrev1900tal"],
	description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser."
};

settings.corporafolders.sakprosa = {
	title : "Sakprosa",
	contents : ["sakprosa1700-1749", "sakprosa1750-1799", "sakprosa1800-1849", "sakprosa1850-1899", "sakprosa1900-1959"],
	description : ""
};

settings.corporafolders.skonlitteratur = {
	title : "Skönlitteratur",
	contents : ["fsbskonlit1800-1849", "fsbskonlit1850-1899", "fsbskonlit1900-1959"],
	description : ""
};

settings.corporafolders.tidskrifter = {
	title : "Tidskrifter",
	contents : [],
	description : ""
};

settings.corporafolders.tidskrifter.tidskrifter1849 = {
	title : "Tidskrifter 1800–1849",
	contents : ["spanskaflugan"],
	description : ""
};

settings.corporafolders.tidskrifter.tidskrifter1899 = {
	title : "Tidskrifter 1850–1899",
	contents : ["ateneum-1800tal", "filosofia1850-1899", "finsktidskrift1800tal", "landtmannen", "litterartidskrift-helsingfors"],
	description : ""
};

settings.corporafolders.tidskrifter.tidskrifter1959 = {
	title : "Tidskrifter 1900–1959",
	contents : ["astra1920-1959", "ateneum-1900tal", "argus", "euterpe", "filosofia1900-1959", "husmodern"],
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

settings.corpora["fsbbrev1800-1849"] = {
	id : "fsbbrev1800-1849",
	title : "Brev 1800–1849",
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

settings.corpora["fsbbrev1850-1899"] = {
	id : "fsbbrev1850-1899",
	title : "Brev 1850–1899",
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

settings.corpora.fsbbrev1900tal = {
	id : "fsbbrev1900tal",
	title : "Brev 1900–1959",
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

settings.corpora["fsbskonlit1800-1849"] = {
	id : "fsbskonlit1800-1849",
	title : "Skönlitteratur 1800–1849",
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

settings.corpora["fsbskonlit1850-1899"] = {
	id : "fsbskonlit1850-1899",
	title : "Skönlitteratur 1850–1899",
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

settings.corpora["ateneum-1800tal"] = {
	id : "ateneum-1800tal",
	title : "Ateneum 1898–1899",
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
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_issue" : {label : "issue"}
	}
};

settings.corpora["ateneum-1900tal"] = {
	id : "ateneum-1900tal",
	title : "Ateneum 1900–1903",
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
		"text_title" : {label : "title"},
		"text_date" : {label : "year"},
		"text_issue" : {label : "issue"}
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

settings.corpora["sakprosa1700-1749"] = {
	id : "sakprosa1700-1749",
	title : "Sakprosa 1700–1749",
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

settings.corpora.spanskaflugan = {
	id : "spanskaflugan",
	title : "Spanska Flugan 1839–1841",
	description : "Spanska Flugan är en polemisk tidskrift, vars redaktör var J.V. Snellman.",
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
		"text_title" : {label : "title"},
		"text_date" : {label : "year"}
	}
};

settings.corpora["astra1920-1959"] = {
	id : "astra1920-1959",
	title : "Astra 1920–1959",
	description : "Tidskrift med kvinnoperspektiv.",
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
		"text_issue" : {label : "issue"},
		"text_date" : {label : "year"}
	}
};

settings.corpora.argus = {
	id : "argus",
	title : "Argus 1907–1911",
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
		"text_issue" : {label : "issue"},
		"text_date" : {label : "year"}
	}
};

settings.corpora.husmodern = {
	id : "husmodern",
	title : "Husmodern 1903–1912",
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
		"text_issue" : {label : "issue"},
		"text_date" : {label : "year"}
	}
};

settings.corpora["landtmannen"] = {
	id : "landtmannen",
	title : "Landtmannen 1877–1879",
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
		"text_issue" : {label : "issue"},
		"text_date" : {label : "year"}
	}
};

settings.corpora["litterartidskrift-helsingfors"] = {
	id : "litterartidskrift-helsingfors",
	title : "Litterär tidskrift utgifven i Helsingfors",
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
		"text_issue" : {label : "issue"},
		"text_date" : {label : "year"}
	}
};

settings.corpora["finsktidskrift1800tal"] = {
	id : "finsktidskrift1800tal",
	title : "Finsk Tidskrift 1850–1899",
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
		"text_issue" : {label : "issue"},
		"text_date" : {label : "year"}
	}
};

settings.corpora.euterpe = {
    id : "euterpe",
    title : "Euterpe 1900–1905",
    description : "Euterpe var en litterär, konstnärlig och samhällskritisk kulturtidskrift.",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : modernAttrs,
    struct_attributes : {
        text_date : {label : "year"},
        text_issue : {label : "issue"}
    }
};

settings.corpusListing = new CorpusListing(settings.corpora);

