/* lemma => grundform, base form
 * lexem => lemgram, lemgram
 * 
 */
var attrs = {};
// structural attributes
var sattrs = {};

var settings = {};
settings.corpora = {};

/*
 * ATTRIBUTES
 */

var attrs = {};  // positional attributes
var sattrs = {}; // structural attributes

attrs.pos = {
	label : language.pos,
	displayType : "select",
	dataset : {
		"AB" : language.AB,
		"DL" : language.DL,
		"DL" : language.DL,
		"DT" : language.DT,
		"HA" : language.HA,
		"HD" : language.HD,
		"HP" : language.HP,
		"HS" : language.HS,
		"IE" : language.IE,
		"IN" : language.IN,
		"JJ" : language.JJ,
		"KN" : language.KN,
		"NN" : language.NN,
		"PC" : language.PC,
		"PL" : language.PL,
		"PM" : language.PM,
		"PN" : language.PN,
		"PP" : language.PP,
		"PS" : language.PS,
		"RG" : language.RG,
		"RO" : language.RO,
		"SN" : language.SN,
		"UO" : language.UO,
		"VB" : language.VB
	}
};
attrs.msd = {
	label : language.msd
};
attrs.baseform = {
	label : language.baseform,
	type : "set"
};
attrs.lemgram = {
	label : language.lemgram,
	type : "set"
};
attrs.saldo = {
	label : language.saldo,
	type : "set"
};
attrs.dephead = {
	label : language.dephead
};
attrs.deprel = {
	label : language.deprel
};
attrs.rel = {
	label : language.rel
};
attrs.prefix = {
	label : language.prefix,
	type : "set"
};
attrs.suffix = {
	label : language.suffix,
	type : "set"
};
attrs.ref = {
	label : language.ref
};

sattrs.date = {
	label : language.date,
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
		article_author : {label : language.author},
		article_section : {label : language.section}
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
		text_id : {label : language.text}
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
		text_id : {label : language.text}
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
		text_genre : {label : language.genre},
		text_id : {label : language.text}
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
		text_id : {label : language.text}
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
			label : language.entity
		},
		dephead : attrs.dephead,
		deprel : attrs.deprel,
		ref : attrs.ref,
		prefix : attrs.prefix,
		suffix : attrs.suffix
	},
	struct_attributes : {
		article_id : {label : language.article},
		text_id : {label : language.text}
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
		text_year : {label : language.year, includeInKWIC : true},
		text_party : {label : language.party, includeInKWIC : true},
		text_type : {label : language.type}
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
		text_author : {label : language.author},
		text_title : {label : language.title}
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
		text_author : {label : language.author},
		text_title : {label : language.title}
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

settings.cgi_script = "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp2.cgi";

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

settings.arg_groups = {
	"ord" : {
		word : language.word_is,
		notword : language.word_is_not,
		beginswith : language.word_beginswith,
		endswith : language.word_endswith,
		regexp : language.matches_regexp
	},
//	"ordklass" : {
//		pos : language.wordclass_is,
//		msd : language.wordclass_starts
//	},
	"intervall" : {
		max : language.max,
		min : language.min
	}
};


settings.inner_args = {
	word : function(s) {
		if(s == "")
			return "[]";
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
