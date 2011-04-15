/* lemma => grundform, base form
 * lexem => lemgram, lemgram
 * 
 */

var settings = {};
settings.corpora = {};

/*
 * ATTRIBUTES
 */

var attrs = {};  // positional attributes
var sattrs = {}; // structural attributes

attrs.pos = {
	label : "pos",
	displayType : "select",
	dataset : {
		"AB" : "AB",
		"DL" : "DL",
		"DL" : "DL",
		"DT" : "DT",
		"HA" : "HA",
		"HD" : "HD",
		"HP" : "HP",
		"HS" : "HS",
		"IE" : "IE",
		"IN" : "IN",
		"JJ" : "JJ",
		"KN" : "KN",
		"NN" : "NN",
		"PC" : "PC",
		"PL" : "PL",
		"PM" : "PM",
		"PN" : "PN",
		"PP" : "PP",
		"PS" : "PS",
		"RG" : "RG",
		"RO" : "RO",
		"SN" : "SN",
		"UO" : "UO",
		"VB" : "VB"
	}
};
attrs.msd = {
	label : "msd"
};
attrs.baseform = {
	label : "baseform",
	type : "set"
};
attrs.lemgram = {
	label : "lemgram",
	type : "set"
};
attrs.saldo = {
	label : "saldo",
	type : "set"
};
attrs.dephead = {
	label : "dephead",
	displayType : "hidden"
};
attrs.deprel = {
	label : "deprel"
};
attrs.prefix = {
	label : "prefix",
	type : "set"
};
attrs.suffix = {
	label : "suffix",
	type : "set"
};
attrs.ref = {
	label : "ref",
	displayType : "hidden"
};

sattrs.date = {
	label : "date",
	displayType : "date"
};

var within = {
	"defaultStruct" : {
		"sentence" : language.sentence
	}
};

var context = {
	"defaultStruct" : {
		"1 sentence" : language.oneSentence
	}
};

/*
 * FOLDERS
 */
 
settings.corporafolders = {};

settings.corporafolders.novels = {
	title : "Skönlitteratur",
	contents : ["romi", "romii", "storsuc"]
};

settings.corporafolders.newspapertexts = {
	title : "Tidningstexter",
	contents : ["gp2009", "konkplus"]
};

/*
 * CORPORA
 */

settings.corpora.gp2009 = {
	title : "GP 2009",
	languages : {
		GP2009 : "svenska"
	},
	context : context.defaultStruct,
	within : within.defaultStruct,
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
		article_date : sattrs.date,
		article_author : {label : "author"},
		article_section : {label : "section"}
	}
};

settings.corpora.suc2 = {
	title : "SUC 2.0",
	languages : {
		SUC2 : "svenska"
	},
	context : context.defaultStruct,
	within : within.defaultStruct,
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
		text_id : {label : "text"}
	}
};

settings.corpora.storsuc = {
	title : "SUC-romaner",
	languages : {
		STORSUC : "svenska"
	},
	context : context.defaultStruct,
	within : within.defaultStruct,
	attributes : {
		pos : attrs.pos,
		msd : attrs.msd,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		saldo : attrs.saldo,
		ref : attrs.ref,
		prefix : attrs.prefix,
		suffix : attrs.suffix,
		dephead : attrs.dephead,
		deprel : attrs.deprel
	},
	struct_attributes : {
		text_id : {label : "text"}
	}
};
/*
 * settings.corpora.saltnld = {title: "SALT-NLD", languages: {SALTNLD_SWE:
 * "svenska", SALTNLD_NLD: "nederländska"}, context: {"1 link": "1 länk", "5
 * words": "5 ord", "10 words": "10 ord"}, within: {"link": "meningspar", "":
 * "allt"}, attributes: {pos: attrs.pos, msd: attrs.msd, lemma: attrs.baseform,
 * lex: attrs.lemgram, saldo: attrs.saldo, dephead: attrs.dephead, deprel:
 * attrs.deprel, ref: attrs.ref, link: attrs.link, text: attrs.text} };
 */
settings.corpora.konkplus = {
	title : "Konkplus: svenska tidningstexter",
	languages : {
		KONKPLUS : "svenska"
	},
	context : context.defaultStruct,
	within : within.defaultStruct,
	attributes : {
		pos : attrs.pos,
		msd : attrs.msd,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		saldo : attrs.saldo,
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref
	},
	struct_attributes : {
		text_genre : {label : "genre"},
		text_id : {label : "text"}
	}
};

settings.corpora.parole = {
	title : "PAROLE",
	languages : {
		PAROLE : "svenska"
	},
	context : context.defaultStruct,
	within : within.defaultStruct,
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
		text_id : {label : "text"}
	}
};

settings.corpora.lt = {
	title : "Läkartidningen (1996)",
	languages : {
		LT : "svenska"
	},
	context : context.defaultStruct,
	within : within.defaultStruct,
	attributes : {
		pos : attrs.pos,
		msd : attrs.msd,
		lemma : attrs.baseform,
		lex : attrs.lemgram,
		saldo : attrs.saldo,
		entity : {
			label : "entity"
		},
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref,
		prefix : attrs.prefix,
		suffix : attrs.suffix
	},
	struct_attributes : {
		article_id : {label : "article"},
		text_id : {label : "text"}
	}
};

settings.corpora.snp7879 = {
	title : "SNP 78-79 (Riksdagens snabbprotokoll)",
	languages : {
		SNP7879 : "svenska"
	},
	context : context.defaultStruct,
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
	struct_attributes : {}
};

settings.corpora.vivill = {
	title : "Svenska partiprogram och valmanifest 1887-2010",
	languages : {
		VIVILL : "svenska"
	},
	context : context.defaultStruct,
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
		text_year : {label : "year", includeInKWIC : true, displayType : "select",
					dataset : {
								"1887" : "1887",
								"1902" : "1902",
								"1904" : "1904",
								"1905" : "1905",
								"1908" : "1908",
								"1911" : "1911",
								"1912" : "1912",
								"1914a|1914b" : "1914",
								"1917" : "1917",
								"1919" : "1919",
								"1920" : "1920",
								"1921" : "1921",
								"1924" : "1924",
								"1928" : "1928",
								"1932" : "1932",
								"1933" : "1933",
								"1934" : "1934",
								"1936" : "1936",
								"1940" : "1940",
								"1944" : "1944",
								"1946" : "1946",
								"1948" : "1948",
								"1951" : "1951",
								"1952" : "1952",
								"1953" : "1953",
								"1956" : "1956",
								"1958" : "1958",
								"1959" : "1959",
								"1960" : "1960",
								"1961" : "1961",
								"1962" : "1962",
								"1964" : "1964",
								"1967" : "1967",
								"1968" : "1968",
								"1969" : "1969",
								"1970" : "1970",
								"1972" : "1972",
								"1973" : "1973",
								"1975" : "1975",
								"1976" : "1976",
								"1979" : "1979",
								"1981" : "1981",
								"1982" : "1982",
								"1984" : "1984",
								"1985" : "1985",
								"1987" : "1987",
								"1988" : "1988",
								"1990" : "1990",
								"1991" : "1991",
								"1993" : "1993",
								"1994" : "1994",
								"1997" : "1997",
								"1998" : "1998",
								"1999" : "1999",
								"2000" : "2000",
								"2001" : "2001",
								"2002" : "2002",
								"2005" : "2005",
								"2006" : "2006",
								"2010" : "2010"
					}},
		text_party : {
			label : "party", 
			includeInKWIC : true,
			displayType : "select",
			dataset: {
				"all" : "Alliansen",
				"c" : "Centerpartiet",
				"rg" : "De rödgröna",
				"fi" : "Feministiskt initiativ",
				"fp" : "Folkpartiet liberalerna",
				"jr" : "Jordbrukarnas riksförbund",
				"kd" : "Kristdemokraterna",
				"la" : "Lantmannapartiet",
				"labp" : "Lantmanna- och borgarepartiet",
				"lisp" : "Liberala samlingspartiet",
				"mp" : "Miljöpartiet de gröna",
				"m" : "Moderata samlingspartiet",
				"npf" : "Nationella framstegspartiet",
				"nyd" : "Ny demokrati",
				"pp" : "Piratpartiet",
				"sd" : "Sverigedemokraterna",
				"k_h" : "Sveriges kommunistiska parti, Höglundarna", 
				"k_k" : "Sverges kommunistiska parti, Kilbommarna", 
				"svp" : "Sverges socialdemokratiska vänsterparti", 
				"lp" : "Sveriges liberala parti",
				"s" : "Sveriges socialdemokratiska arbetareparti", 
				"v" : "Vänsterpartiet"
				}
			},
		text_type : {label : "type"}
	}
};

settings.corpora.romi = {
	title : "Bonniersromaner I (1976-77)",
	languages : {
		ROMI : "svenska"
	},
	context : context.defaultStruct,
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
		text_author : {label : "author"},
		text_title : {label : "title"}
	}
};

settings.corpora.romii = {
	title : "Bonniersromaner II (1980-81)",
	languages : {
		ROMII : "svenska"
	},
	context : context.defaultStruct,
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
		text_author : {label : "author"},
		text_title : {label : "title"}
	}
};

settings.corpora.drama = {
	title : "Dramawebben (demo)",
	languages : {
		DRAMA : "svenska"
	},
	context : context.defaultStruct,
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
	struct_attributes : {}
};

/*
 * MISC
 */

settings.cgi_script = "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi";

settings.arg_types = {
	"word" : String,
	"notword" : String,
	"beginswith" : String,
	"endswith" : String,
	"regexp" : RegExp,
	"pos" : attrs.pos.dataset,
	"msd" : String,
	"max" : Number,
	"min" : Number
};
// values here represent translation keys.
settings.arg_groups = {
	"ord" : {
		word : "word_is",
		notword : "word_is_not",
		beginswith : "word_beginswith",
		endswith : "word_endswith",
		regexp : "matches_regexp"
	},
//	"ordklass" : {
//		pos : language.wordclass_is,
//		msd : language.wordclass_starts
//	},
	"intervall" : {
		max : "max",
		min : "min"
	}
};


settings.inner_args = {
	word : function(s) {
//		if(s == "")
//			return "[]";
		return 'word = "' + regescape(s) + '"';
	},
	notword : function(s) {
		return 'word != "' + regescape(s) + '"';
	},
	beginswith : function(s) {
		return 'word = "' + regescape(s) + '.*"';
	},
	endswith : function(s) {
		return 'word = ".*' + regescape(s) + '"';
	},
	regexp : function(s) {
		return 'word = "' + s + '"';
	},
	pos : function(s) {
		return 'pos = "' + regescape(s) + '"';
	},
	msd : function(s) {
		return 'msd = "' + regescape(s) + '.*"';
	}
	
};

settings.outer_args = {
	min : function(query, values) {
		query.min = Math.min(values);
	},
	max : function(query, values) {
		query.max = Math.max(values);
	}
};

settings.operators = {
	include : "eller",
	intersect : "och",
	exclude : "men inte"
};

settings.first_operators = {
	find : "Leta efter"
};

delete attrs;
delete sattrs;
delete within;
delete context;
delete ref;
