
settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;
settings.fsvdescription ='<a href="http://project2.sol.lu.se/fornsvenska/">Fornsvenska textbanken</a> är ett projekt som digitaliserar fornsvenska texter och gör dem tillgängliga över webben. Projektet leds av Lars-Olof Delsing vid Lunds universitet.';
  

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


settings.corpora["fsv-yngrelagar"] = {
	id : "fsv-yngrelagar",
	title : "Yngre lagar – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
		pos : {
 		 	type : "set",
 		 	label : "pos"
  			},
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		fsvvariants : {
 		 	type : "set",
 		 	label : "variants"
  			}
        },
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : {
				"Kristoffers Landslag, innehållsligt ändrade flockar i förhållande til MEL" : "Kristoffers Landslag, innehållsligt ändrade flockar i förhållande til MEL",
				"Kristoffers Landslag" : "Kristoffers Landslag",
				"Kristoffers Landslag, flockar direkt hämtade från MEL" : "Kristoffers Landslag, flockar direkt hämtade från MEL",
				"Kristoffers Landslag, nyskrivna flockar i förhållande till MEL" : "Kristoffers Landslag, nyskrivna flockar i förhållande till MEL"
			},
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-aldrelagar"] = {
	id : "fsv-aldrelagar",
	title : "Äldre lagar – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
		pos : attrs.pos,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		fsvvariants : {
 		 	type : "set",
 		 	label : "variants"
  			}
        },
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Yngre Västgötalagens äldsta fragment, Lydekini excerpter och anteckningar",
				"Södermannalagen, enligt Codex iuris Sudermannici",
				"Östgötalagen, fragment H, ur Kyrkobalken ur Skokloster Avdl I 145",
				"Yngre Västmannalagen, enl Holm B 57",
				"Vidhemsprästens anteckningar",
				"Magnus Erikssons Stadslag, exklusiva stadslagsflockar",
				"Södermannalagens additamenta, efter NKS 2237",
				"Hälsingelagen",
				"Yngre Västgötalagen, tillägg, enligt Holm B 58",
				"Östgötalagen, fragment C, ur Holm B 1709",
				"Yngre Västgötalagen, enligt Holm B 58",
				"Upplandslagen enl Schlyters utgåva och Codex Ups C 12, hskr A",
				"Skånelagen",
				"Östgötalagen, fragment D, ur Holm B 24",
				"Östgötalagen A, ur Holm B 50",
				"Äldre Västgötalagen",
				"Östgötalagen, fragment M, ur Holm B 196",
				"Gutalagen enligt Holm B 64",
				"Upplandslagen enligt Codex Holm B 199, Schlyters hskr B",
				"Gutalagens additamenta enligt AM 54",
				"Smålandslagens kyrkobalk",
				"Dalalagen (Äldre Västmannalagen)",
				"Tillägg till Upplandslagen, hskr A (Ups B 12)",
				"Bjärköarätten",
				"Magnus Erikssons Landslag",
				"Östgötalagen, fragment N, ur Köpenhamn AM 1056",
				"Södermannalagen stadsfästelse - Confirmatio, enligt NKS 2237",
				"Östgötalagen, fragment E, ur Ups B 22"
			],
        },	
		text_date : {label : "date"}
	}
};



settings.corpora["lag1734"] = {
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
	id : "lag1800",
	title : "Lagar från 1800-talet",
	description : "Östgötalagen 1895, Regeringsformen 1809 med ändringar 1809-1974, Författningssamling Låssa kyrkas arkiv 1800",
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
		pos : {
 		 	type : "set",
 		 	label : "pos"
  			},
		//pos : attrs.pos,
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
		paragraph_marginal : {label : "paragraph_marginal"}
	}
};

settings.corpora["tankebok"] = {
	id : "tankebok",
	title : "Stockholms stads tänkeböcker",
	description : "Stockholms stads tänkeböcker från 1626",
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {},
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

settings.corpora["sfs"] = {
	id : "sfs",
	title : "Svensk författningssamling",
	description : "",
	within : settings.defaultWithin,
	context : settings.spContext,
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
		text_date : {label : "date"},
		text_title : {label : "title"}
	}
};



settings.corpora["sfs"] = {
	id : "sfs",
	title : "Svensk författningssamling",
	description : "",
	within : settings.defaultWithin,
	context : settings.spContext,
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

