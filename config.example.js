/* lemma => grundform, base form
 * lexem => lemgram, lemgram
 * 
 */

var settings = {};
settings.primaryColor = "#dde9ff";
settings.corpora = {};
settings.defaultContext = {
	"1 sentence" : language.oneSentence
};
settings.defaultWithin = {
	"sentence" : language.oneSentence	
};

settings.defaultLanguage = "sv";

/*
 * ATTRIBUTES
 */

settings.defaultOptions = {
	"is" : "is",
	"is_not" : "is_not",
	"starts_with" : "starts_with",
	"ends_with" : "ends_with",
	"matches" : "matches"
};
settings.liteOptions = $.exclude(settings.defaultOptions, ["starts_with", "ends_with", "matches"]);

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
	},
	opts : settings.liteOptions
};
attrs.msd = {
	label : "msd",
	opts : {}
};
attrs.baseform = {
	label : "baseform",
	displayType : "autocomplete",
	opts : settings.liteOptions
};
attrs.lemgram = {
	label : "lemgram",
	type : "set",
	displayType : "autocomplete",
	opts : settings.liteOptions
};
attrs.saldo = {
	label : "saldo",
	type : "set",
	displayType : "autocomplete",
	opts : settings.liteOptions
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
	type : "set",
	displayType : "autocomplete",
	opts : settings.liteOptions
};
attrs.suffix = {
	label : "suffix",
	type : "set",
	displayType : "autocomplete",
	opts : settings.liteOptions
};
attrs.ref = {
	label : "ref",
	displayType : "hidden"
};
attrs.link = {
	label : "sentence_link"
};
attrs.text = {
	label : "text"
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
	"defaultAligned" : {
		"1 link" : "1 link"
	}
};

/*
 * FOLDERS
 */
 
settings.corporafolders = {};

settings.corporafolders.novels = {
	title : "Skönlitteratur",
	contents : ["romi", "romii", "rom99", "strindbergromaner", "storsuc", "romg"]
};

settings.corporafolders.newspapertexts = {
	title : "Tidningstexter",
	contents : ["dn1987", "fof", "ordat"]
};

settings.corporafolders.newspapertexts.gp = {
	title : "GP",
	contents : ["gp1994", "gp2001", "gp2002", "gp2003", "gp2004", "gp2005", "gp2006", "gp2007", "gp2008", "gp2009", "gp2d"]
};

settings.corporafolders.newspapertexts.press = {
	title : "Press",
	contents : ["press65", "press76", "press95", "press96", "press97", "press98"]
};

settings.corporafolders.fisk = {
	title : "Finlandssvenska texter",
	contents : []
};

settings.corporafolders.fisk.essayistic = {
	title : "Essäistisk litteratur",
	contents : ["fsbessaistik"]
};

settings.corporafolders.fisk.articles = {
	title : "Sakprosa",
	contents : ["fsbsakprosa"]
};

settings.corporafolders.fisk.novels = {
	title : "Skönlitteratur",
	contents : ["fsbskonlit"]
};

settings.corporafolders.fisk.newspapertexts = {
	title : "Tidningstexter",
	contents : ["vasabladet"]
};

settings.corporafolders.fisk.newspapertexts.hbl = {
	title : "Hufvudstadsbladet 1991, 1998-1999",
	contents : ["hbl1991", "hbl1998", "hbl1999"]
};

settings.corporafolders.fisk.newspapertexts.jakobstadstidning = {
	title : "Jakobstads tidning 1999-2000",
	contents : ["jakobstadstidning1999", "jakobstadstidning2000"]
};

settings.corporafolders.fisk.magazines = {
	title : "Tidskrifter",
	contents : ["astranova", "kallan", "nyaargus", "svenskbygden"]
};

settings.corporafolders.medical = {
	title : "Medicinska texter",
	contents : ["diabetolog", "lt", "smittskydd"]
};

settings.corporafolders.parallel = {
	title : "Parallella material",
	contents : []
};

settings.corporafolders.parallel.europarl = {
	title : "Europarl",
	contents : ["europarlda_sv"]
};

settings.corporafolders.parallel.salt = {
	title : "SALT",
	contents : ["saltnld_swe"]
};

/*
 * CORPORA
 */

settings.corpora.fsbskonlit = {
	title : "Skönlitteratur 1970-2011",
	languages : {
		FSBSKONLIT : "svenska"
	},
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
	    text_author : {label : "author"},
	    text_title : {label : "title"},
	    text_year : {label : "year"},
	    text_publisher : {label : "publisher"}
	}
};

settings.corpora.fsbessaistik = {
	title : "Essäistisk litteratur 1970-2011",
	languages : {
		FSBESSAISTIK : "svenska"
	},
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
	    text_author : {label : "author"},
	    text_title : {label : "title"},
	    text_year : {label : "year"},
	    text_publisher : {label : "publisher"}
	}
};

settings.corpora.fsbsakprosa = {
	title : "Sakprosa 1970-2011",
	languages : {
		FSBSAKPROSA : "svenska"
	},
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
	    text_author : {label : "author"},
	    text_title : {label : "title"},
	    text_year : {label : "year"},
	    text_publisher : {label : "publisher"}
	}
};

settings.corpora.svenskbygden = {
	title : "Svenskbygden 2010-2011",
	languages : {
		SVENSKBYGDEN : "svenska"
	},
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
	    text_year : {label : "year"},
	    text_issue : {label : "issue"}
	}
};

settings.corpora.jakobstadstidning1999 = {
	title : "Jakobstads tidning 1999",
	languages : {
		JAKOBSTADSTIDNING1999 : "svenska"
	},
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
	}
};

settings.corpora.jakobstadstidning2000 = {
	title : "Jakobstads tidning 2000",
	languages : {
		JAKOBSTADSTIDNING2000 : "svenska"
	},
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
	}
};

settings.corpora.dn1987 = {
	title : "DN 1987",
	languages : {
		DN1987 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp1994 = {
	title : "GP 1994",
	languages : {
		GP1994 : "svenska"
	},
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
		text_date : sattrs.date,
		text_section : {label : "section"}
	}
};

settings.corpora.gp2001 = {
	title : "GP 2001",
	languages : {
		GP2001 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp2002 = {
	title : "GP 2002",
	languages : {
		GP2002 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp2003 = {
	title : "GP 2003",
	languages : {
		GP2003 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp2004 = {
	title : "GP 2004",
	languages : {
		GP2004 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp2005 = {
	title : "GP 2005",
	languages : {
		GP2005 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp2006 = {
	title : "GP 2006",
	languages : {
		GP2006 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp2007 = {
	title : "GP 2007",
	languages : {
		GP2007 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp2008 = {
	title : "GP 2008",
	languages : {
		GP2008 : "svenska"
	},
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
		text_date : sattrs.date,
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.gp2009 = {
	title : "GP 2009",
	languages : {
		GP2009 : "svenska"
	},
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
		text_date : sattrs.date,
		text_author : {label : "article_author"},
		text_section : {label : "article_section"}
	}
};

settings.corpora.gp2d = {
	title : "GP - Två dagar",
	languages : {
		GP2D : "svenska"
	},
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
		text_issue : {label : "issue"}
	}
};

settings.corpora.ordat = {
	title : "ORDAT: Svenska dagbladets årsbok 1923 - 1958",
	languages : {
		ORDAT : "svenska"
	},
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
		text_year : {label : "text_year"},
		text_volume : {label : "text_year"}
	}
};

settings.corpora.fof = {
	title : "Forskning och framsteg",
	languages : {
		FOF : "svenska"
	},
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
		text_issue : {label : "issue"}
	}
};

settings.corpora.press65 = {
	title : "Press 65",
	languages : {
		PRESS65 : "svenska"
	},
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
		text_date : {label : "date"},
		text_publisher : {label : "article_publisher"},
		text_topic : {label : "article_topic"},
		text_genre : {label : "article_genre"}
	}
};

settings.corpora.press76 = {
	title : "Press 76",
	languages : {
		PRESS76 : "svenska"
	},
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
		text_year : {label : "year"},
		text_publisher : {label : "article_publisher"}
	}
};

settings.corpora.press95 = {
	title : "Press 95",
	languages : {
		PRESS95 : "svenska"
	},
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
		text_date : {label : "date"},
		text_publisher : {label : "article_publisher"},
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.press96 = {
	title : "Press 96",
	languages : {
		PRESS96 : "svenska"
	},
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
		text_date : {label : "date"},
		text_publisher : {label : "article_publisher"},
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.press97 = {
	title : "Press 97",
	languages : {
		PRESS97 : "svenska"
	},
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
		text_date : {label : "date"},
		text_publisher : {label : "publisher"},
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.press98 = {
	title : "Press 98",
	languages : {
		PRESS98 : "svenska"
	},
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
		text_date : {label : "date"},
		text_publisher : {label : "article_publisher"},
		text_sectionshort : {label : "section"}
	}
};

settings.corpora.bloggmix = {
	title : "Bloggmix (september 2011)",
	languages : {
		BLOGGMIX : "svenska"
	},
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
		blog_title : {label : "blog_title"},
		blog_url : {label : "blog_url", type : "url"},
		blog_age : {label : "author_age"},
		blog_city : {label : "city"},
		//blog_categories : {label : "title", type : "set"},
		post_title : {label : "post_title"},
		post_date : {label : "date"},
		post_tags : {label : "tags", type : "set"},
		post_url : {label : "post_url", type : "url"}
	}
};

settings.corpora.suc2 = {
	title : "SUC 2.0",
	languages : {
		SUC2 : "svenska"
	},
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

//settings.corpora.saltnld = {
settings.corpora.saltnld_swe = {
	title: "Svenska-nederländska", 
	languages : { 
		SALTNLD_SWE: "svenska", 
		SALTNLD_NLD: "nederländska"
	}, 
	context: context.defaultAligned, 
	within: {
		"link": "meningspar"
	}, 
	attributes: {
		pos: attrs.pos, 
		msd: attrs.msd, 
		lemma: attrs.baseform,
		lex: attrs.lemgram, 
		saldo: attrs.saldo, 
		dephead: attrs.dephead, 
		deprel: attrs.deprel, 
		ref: attrs.ref, 
		link: attrs.link, 
		text: attrs.text
	},
	struct_attributes : {
//		text_origlang : {
//			label : "original_language"
//		}
	}
};

settings.corpora.europarlda_sv = {
	title: "Svenska-danska", 
	languages : { 
		EUROPARLDA_SV: "svenska", 
		EUROPARLDA_DA: "danska"
	}, 
	context: context.defaultAligned, 
	within: {
		"link": "meningspar"
	}, 
	attributes: {
		pos: attrs.pos, 
		msd: attrs.msd, 
		lemma: attrs.baseform,
		lex: attrs.lemgram, 
		saldo: attrs.saldo, 
		dephead: attrs.dephead, 
		deprel: attrs.deprel, 
		ref: attrs.ref, 
		link: attrs.link, 
		text: attrs.text
	},
	struct_attributes : {
//		text_origlang : {
//			label : "original_language"
//		}
	}
};

settings.corpora.parole = {
	title : "PAROLE",
	languages : {
		PAROLE : "svenska"
	},
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

settings.corpora.diabetolog = {
	title : "DiabetologNytt (1996-1999)",
	languages : {
		diabetolog : "svenska"
	},
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
		text_year : {label : "year"},
		text_title : {label : "title"},
		text_source : {label : "url", type : "url"}
	}
};

settings.corpora.lt = {
	title : "Läkartidningen (1996)",
	languages : {
		LT : "svenska"
	},
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
		text_article : {label : "article"},
		text_id : {label : "text"}
	}
};

settings.corpora.smittskydd = {
	title : "Smittskydd",
	languages : {
		SMITTSKYDD : "svenska"
	},
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
		text_year : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.snp7879 = {
	title : "SNP 78-79 (Riksdagens snabbprotokoll)",
	languages : {
		SNP7879 : "svenska"
	},
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

settings.corpora.romg = {
	title : "Äldre svenska romaner",
	languages : {
		ROMG : "svenska"
	},
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
		text_title : {label : "title"},
		text_year : {label : "year"}
	}
};

settings.corpora.rom99 = {
	title : "Norstedtsromaner (1999)",
	languages : {
		ROM99 : "svenska"
	},
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
		text_title : {label : "title"},
		text_year : {label : "year"}
	}
};

settings.corpora.strindbergromaner = {
	title : "Strindbergs romaner och dramer",
	languages : {
		STRINDBERGROMANER : "svenska"
	},
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
		text_title : {label : "title"},
		text_year : {label : "year"},
		text_sv : {label : "text_sv"}
	}
};

settings.corpora.strindbergbrev = {
	title : "Strindbergs brev",
	languages : {
		STRINDBERGBREV : "svenska"
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
		text_recipient : {label : "text_recipient"},
		text_year : {label : "year"},
		text_month : {label : "month"},
		text_day : {label : "day"},
		text_volume : {label : "text_volume"}
	}
};

settings.corpora.sfs = {
	title : "Svensk författningssamling 1978-1981",
	languages : {
		SFS : "svenska"
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
		text_ref : {label : "referensnummer"},
		text_year : {label : "year"}
	}
};

settings.corpora.psalmboken = {
	title : "Psalmboken (1937)",
	languages : {
		PSALMBOKEN : "svenska"
	},
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
		text_year : {label : "year"}
	}
};

settings.corpora.lasbart = {
	title : "LäSBarT - Lättläst svenska och barnbokstext",
	languages : {
		LASBART : "svenska"
	},
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
		text_source : {label : "source"},
		text_type : {label : "type"},
		text_date : {label : "date"},
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_age : {label : "age"}
	}
};

settings.corpora.drama = {
	title : "Dramawebben (demo)",
	languages : {
		DRAMA : "svenska"
	},
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

settings.corpora.wikipedia = {
	title : "Svenska Wikipedia (augusti 2011)",
	languages : {
		WIKIPEDIA : "svenska"
	},
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
		text_title : {label : "article"},
		text_url : {label : "url", type : "url"}
	}
};

settings.corpora.astranova = {
	title : "Astra Nova 2008-2010",
	languages : {
		ASTRANOVA : "svenska"
	},
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
		text_year : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.kallan = {
	title : "Källan 2008-2010",
	languages : {
		KALLAN : "svenska"
	},
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
		text_year : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.nyaargus = {
	title : "Nya Argus 2010-2011",
	languages : {
		NYAARGUS : "svenska"
	},
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
		text_year : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.vasabladet = {
	title : "Vasabladet 1991",
	languages : {
		VASABLADET : "svenska"
	},
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
		text_year : {label : "year"},
		text_issue : {label : "issue"},
		text_type : {label : "section"}
	}
};

settings.corpora.hbl1991 = {
	title : "Hufvudstadsbladet 1991",
	languages : {
		HBL1991 : "svenska"
	},
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
	    text_year : {label : "year"},
	    text_type : {label : "section"}
	}
};

settings.corpora.hbl1998 = {
	title : "Hufvudstadsbladet 1998",
	languages : {
		HBL1998 : "svenska"
	},
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
	    text_year : {label : "year"}
	}
};

settings.corpora.hbl1999 = {
	title : "Hufvudstadsbladet 1999",
	languages : {
		HBL1999 : "svenska"
	},
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
	    text_year : {label : "year"}
	}
};

/*
 * MISC
 */

settings.cgi_script = "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi";

//settings.arg_types = {
//	"word" : String,
//	"notword" : String,
//	"beginswith" : String,
//	"endswith" : String,
//	"regexp" : RegExp,
//	"pos" : attrs.pos.dataset,
//	"msd" : String,
//	"max" : Number,
//	"min" : Number
//};
// values here represent translation keys.
settings.arg_groups = {
	"word" : {
		word : {label : "word"},
//		notword : "word_is_not",
//		beginswith : "word_beginswith",
//		endswith : "word_endswith",
		anyword : {label : "any", opts : {}}
//		regexp : "matches_regexp"
	},
//	"ordklass" : {
//		pos : language.wordclass_is,
//		msd : language.wordclass_starts
//	},
	"interval" : {
		max : {label : "max", opts : {}},
		min : {label : "min", opts : {}}
	}
};


settings.inner_args = {
//	word : function(s, op) {
//		var formatter = op == "matches" ? function(arg) {return arg;} : regescape;
//		op = {
//			"is" : ["=", "", ""],
//			"is_not" : ["!=", "", ""],
//			"starts_with" : ["=", "", ".*"],
//			"ends_with" : ["=", ".*", ""],
//			"matches" : "matches"
//		}[op];
//		return $.format('word %s "%s%s%s"', [op, formatter(s)]);
////		return 'word = "' + regescape(s) + '"';
//	},
//	notword : function(s) {
//		return 'word != "' + regescape(s) + '"';
//	},
//	beginswith : function(s) {
//		return 'word = "' + regescape(s) + '.*"';
//	},
//	endswith : function(s) {
//		return 'word = ".*' + regescape(s) + '"';
//	},
	anyword : function(s) {
		return "";
	},
//	regexp : function(s) {
//		return 'word = "' + s + '"';
//	},
//	pos : function(s) {
//		return 'pos = "' + regescape(s) + '"';
//	},
	msd : function(s) {
		return 'msd = "' + regescape(s) + '.*"';
	}
//	lemma : function(s, op) {
//		return $.format('lemma contains "%s"', s.split(".")[0]); 
//	}
	
};

settings.outer_args = {
	min : function(query, values) {
		query.min = Math.min(values);
	},
	max : function(query, values) {
		query.max = Math.max(values);
	}
};

//settings.operators = {
//	include : "eller",
//	intersect : "och",
//	exclude : "men inte"
//};

//settings.first_operators = {
//	find : "Leta efter"
//};

delete attrs;
delete sattrs;
delete within;
delete context;
delete ref;
