
settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corporafolders.magazines = {
	title : "Moderna lagar och rättsfall",
	contents : ["moderntsfs", "moderntdv"]
};
settings.corpora.fsvlagrummetnew = {
	id : "fsvlagrummetnew",
	title : "Fornsvenska textbankens lagtexter",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_date : {
			label : "date"
		},
		text_title : {
			label : "title"
		}
	}
};
settings.corpora["lag1734"] = {
	id : "lag1734",
	title : "1734 års lag",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_date : {
			label : "date"
		},
		text_title : {
			label : "title"
		}
	}
};

settings.corpora["lag1734foerarbeten"] = {
	id : "lag1734foerarbeten",
	title : "1734 års lag – Förarbeten",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {
//		pos : attrs.pos,
//		msd : attrs.msd,
//		lemma : attrs.baseform,
//		lex : attrs.lemgram,
//		saldo : attrs.saldo,
//		prefix : attrs.prefix,
//		suffix : attrs.suffix,
//		dephead : attrs.dephead,
//		deprel : attrs.deprel,
//		ref : attrs.ref
	},
	struct_attributes : {
		text_date : {
			label : "date"
		},
		text_title : {
			label : "title"
		},
		paragraph_marginal : {
			label : "paragraph_marginal"
		}
	}
};

settings.corpora["tankebok"] = {
	id : "tankebok",
	title : "Stockholms stads tänkeböcker",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_date : {
			label : "date"
		},
		text_title : {
			label : "title"
		}
	}
};

settings.corpora["moderntsfs"] = {
	id : "moderntsfs",
	title : "Svensk författningssamling",
	description : "",
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
		ref : attrs.ref
	},
	struct_attributes : {
		text_date : {
			label : "date"
		},
		text_title : {
			label : "title"
		}
//			text_datefrom : {
//				
//			}
	}
};
settings.corpora["moderntdv"] = {
	id : "moderntdv",
	title : "Domar",
	description : "",
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
		ref : attrs.ref
	},
	struct_attributes : {
		text_date : {
			label : "date"
		},
		text_title : {
			label : "title"
		}
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

