
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
settings.corporafolders.modern = {
	title : "Moderna lagar och rättsfall",
	contents : ["sfs", "moderntdv"]
};

settings.corporafolders.fsvlagar = {
	title : "Fornsvenska textbankens lagtexter",
	contents : ["fsv-aldrelagar", "fsv-yngrelagar"]
};


settings.corpora["fsv-yngrelagar"] = fsv_yngrelagar; 

settings.corpora["fsv-aldrelagar"] = fsv_aldrelagar;


settings.corpora["tankebok"] = {
        morf : 'swedbergm|dalinm',
	id : "tankebok",
	title : "Stockholms stads tänkeböcker",
	description : "Stockholms stads tänkeböcker från 1626",
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
        	posset :  settings.posset,
		lemma : attrs.baseform,
		lex : attrs.lemgram
                },
	struct_attributes : {
		text_date : {label : "date"},
		text_title : {
			label : "title",
			displayType : "select",
			dataset : {
				"Stockholms stads tänkebok - Koncept " : "sst_koncept",
				"Stockholms stads tänkebok - Notariat" : "sst_notariat",
				"Stockholms stads tänkebok - Renskr " : "sst_renskr"
			},
	                opts : settings.liteOptions

		},
		paragraph_marginal : {label : "paragraph_marginal"}
	}
};


settings.corpora["lag1734"] = {
        morf : 'swedbergm|dalinm',
	id : "lag1734",
	title : "1734 års lag",
	description : "Förord, Lagtext, Domarregler, Förarbeten volym 1-8, Missgierningsbalk, Giftermålsbalk",
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
		lemma : attrs.baseform,
		lex : attrs.lemgram
                },
	struct_attributes : {
		paragraph_marginal : {label : "paragraph_marginal"},
		text_date : {label : "date"},
		text_title : {
			label : "title",
			displayType : "select",
			dataset : {
				"1734 års lag Förord" : "forord1734",
				"1734 års lag Domareregler" : "domareregler1734",
				"1734 års lag Lagtext" : "Lagtext1734",
				"1734 års lag Förarbeten vol 1-3" : "forarbeten1734v1-3",
				"1734 års lag Förarbeten vol 4" : "forarbeten1734v4",
				"1734 års lag Förarbeten vol 5" : "forarbeten1734v5",
				"1734 års lag Förarbeten vol 6" : "forarbeten1734v6",
				"1734 års lag Förarbeten vol 7" : "forarbeten1734v7",
				"1734 års lag Förarbeten vol 8" : "forarbeten1734v8",
				"Giftermåls balk \(1734\)": "giftermalsbalk",
				"Missgierningsbalk": "missgierningsbalk"
			},
            opts : settings.liteOptions
		}
	}
};


settings.corpora["lag1800"] = {
        morf : 'saldom|dalinm',
	id : "lag1800",
	title : "Lagar från 1800-talet",
	description : "Östgötalagen 1895, Regeringsformen 1809 med ändringar 1809-1974, Författningssamling Låssa kyrkas arkiv 1800",
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
        	posset :  settings.posset,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		saldo : attrs.saldo,
		prefix : attrs.prefix,
		suffix : attrs.suffix
	},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			dataset : {
				"Författningssamling 1800 Låssa kyrkas arkiv" : "lassakyrka",
				"Östgötalagen": "ostgotalagen",
				"Regeringsformen 1809 ": "regeringsformen"
			},
	                opts : settings.liteOptions

		},
		text_date : {label : "date"},
		text_marginal : {label : "paragraph_marginal"}
	}
};

settings.corpora["sfs"] = {
	id : "sfs",
	title : "Svensk författningssamling",
	description : "",
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
                posset : settings.posset,
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
		text_date : {label : "date"},
		text_title : {label : "title"}
	}
};
settings.corpora["moderntdv"] = {
	id : "moderntdv",
	title : "Domar",
	description : "",
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
                posset : settings.posset,
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
		text_date : {label : "date"},
		text_title : {label : "title"}
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

