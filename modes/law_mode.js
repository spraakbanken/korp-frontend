
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
	description : "Giftermåls balk, Kristoffers Landslag, Konungastyrelsen, Magnus Erikssons Landslag, Magnus Erikssons Stadslag",
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
	description : "Förord, Lagtext, Domarregler, Förarbeten volym 1-8, Missgierningsbalk",
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
settings.corpora["lag1800"] = {
	id : "lag1800",
	title : "Lagar från 1800-talet",
	description : "Östgötalagen 1895, Regeringsformen 1809 med ändringar 1809-1974, Författningssamling Låssa kyrkas arkiv 1800",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_title : {
			label : "title"
		},
		paragraph_date : {
			label : "date"
			
		},
		paragraph_marginal : {
			label : "paragraph_marginal"
		}
	}
};


settings.corpora["tankebok"] = {
	id : "tankebok",
	title : "Stockholms stads tänkeböcker",
	description : "Stockholms stads tänkeböcker från 1626",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
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

