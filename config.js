/* lemma => grundform, base form
 * lexem => lemgram, lemgram
 * 
 */
var settings = {};
//var language = $.localize.data.locale;

settings.lemgramSelect = true;
settings.autocomplete = true;

settings.primaryColor = "rgb(221, 233, 255)";
settings.primaryLight = "rgb(242, 247, 255)";
settings.corpora = {};
settings.defaultContext = {
	"1 sentence" : "1 sentence"
};
settings.defaultWithin = {
	"sentence" : "sentence"	
};

settings.defaultLanguage = "sv";

/*
 * ATTRIBUTES
 */
// for optimization purposes
settings.cqp_prio = ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'grundform', 'lemgram', 'saldo', 'word'];

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
	translationKey : "pos_",
	dataset : {
		"AB" : "AB",
		"MID|MAD|PAD" : "DL",
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
	opts : settings.defaultOptions
};
attrs.baseform = {
	label : "baseform",
	type : "set",
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
		label : "deprel",
		displayType : "select",
		translationKey : "deprel_",
		dataset : {
			"++" : "++",
			"+A" : "+A",
			"+F" : "+F",
			"AA" : "AA",
			"AG" : "AG",
			"AN" : "AN",
			"AT" : "AT",
			"CA" : "CA",
			"DB" : "DB",
			"DT" : "DT",
			"EF" : "EF",
			"EO" : "EO",
			"ES" : "ES",
			"ET" : "ET",
			"FO" : "FO",
			"FP" : "FP",
			"FS" : "FS",
			"FV" : "FV",
			"I?" : "I?",
			"IC" : "IC",
			"IG" : "IG",
			"IK" : "IK",
			"IM" : "IM",
			"IO" : "IO",
			"IP" : "IP",
			"IQ" : "IQ",
			"IR" : "IR",
			"IS" : "IS",
			"IT" : "IT",
			"IU" : "IU",
			"IV" : "IV",
			"JC" : "JC",
			"JG" : "JG",
			"JR" : "JR",
			"JT" : "JT",
			"KA" : "KA",
			"MA" : "MA",
			"MS" : "MS",
			"NA" : "NA",
			"OA" : "OA",
			"OO" : "OO",
			"OP" : "OP",
			"PL" : "PL",
			"PR" : "PR",
			"PT" : "PT",
			"RA" : "RA",
			"SP" : "SP",
			"SS" : "SS",
			"TA" : "TA",
			"TT" : "TT",
			"UK" : "UK",
			"VA" : "VA",
			"VO" : "VO",
			"VS" : "VS",
			"XA" : "XA",
			"XF" : "XF",
			"XT" : "XT",
			"XX" : "XX",
			"YY" : "YY",
			"CJ" : "CJ",
			"HD" : "HD",
			"IF" : "IF",
			"PA" : "PA",
			"UA" : "UA",
			"VG" : "VG"
		},
		opts : settings.liteOptions
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
		"sentence" : "sentence"
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

settings.corporafolders.sweac = {
	title : "Akademiska texter",
	contents : ["sweachum"]
};

settings.corporafolders.fisk = {
	title : "Finlandssvenska texter",
	contents : [],
	description : "Det första steget för att skapa en finlandssvensk korpus togs redan " +
			"på 1990-talet (Institutionen för nordiska språk vid Helsingfors universitet) " +
			"och under åren 1999–2000 fortsatte arbetet (ett samarbetsprojekt mellan " +
			"Institutet för de inhemska språken, Institutionen för allmän språkvetenskap " +
			"och CSC (IT Center for Science)). Under åren 2011–2013 byggs den finlandssvenska " +
			"korpusen ut som ett samarbetsprojekt mellan Svenska litteratursällskapet i Finland, " +
			"Institutet för de inhemska språken och Göteborgs universitet."
};

settings.corporafolders.fisk.blogs = {
	title : "Bloggtexter",
	contents : ["fsbbloggvuxna"]
};

settings.corporafolders.fisk.essayistic = {
	title : "Essäistisk litteratur",
	contents : ["fsbessaistik"]
};

settings.corporafolders.fisk.articles = {
	title : "Sakprosa",
	contents : ["fsbsakprosa"]
};

settings.corporafolders.fisk.governmental = {
	title : "Myndighetstexter",
	contents : ["lagtexter", "myndighet"]
};

settings.corporafolders.fisk.novels = {
	title : "Skönlitteratur",
	contents : ["fsbskonlit"]
};

settings.corporafolders.fisk.newspapertexts = {
	title : "Tidningstexter",
	contents : ["pargaskungorelser", "vasabladet", "osterbottenstidning2011"]
};

settings.corporafolders.fisk.newspapertexts.fnb = {
	title : "FNB 1999–2000",
	contents : ["fnb1999", "fnb2000"],
	description : "FNB är Finlands ledande nyhets- och bildbyrå."
	// http://www.stt.fi/sv
};

settings.corporafolders.fisk.newspapertexts.hbl = {
	title : "Hufvudstadsbladet 1991, 1998–1999",
	contents : ["hbl1991", "hbl1998", "hbl1999"],
	description : "Hufvudstadsbladet är den största finlandssvenska dagstidningen i Finland."
	//description : "<a href=\"http://www.hbl.fi\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland."
};

settings.corporafolders.fisk.newspapertexts.jakobstadstidning = {
	title : "Jakobstads tidning 1999–2000",
	contents : ["jakobstadstidning1999", "jakobstadstidning2000"],
	description : "Jakobstads Tidning var en lokal dagstidning i Österbotten som gavs ut under perioden 1898–2008."
};

settings.corporafolders.fisk.magazines = {
	title : "Tidskrifter",
	contents : ["astranova", "hanken", "kallan", "meddelanden", "nyaargus", "studentbladet", "svenskbygden"]
};

settings.corporafolders.medical = {
	title : "Medicinska texter",
	contents : ["diabetolog", "smittskydd"]
};

settings.corporafolders.medical.ltd = {
	title : "Läkartidningen",
	contents : ["lt1996", "lt1997", "lt1998", "lt1999", "lt2000", "lt2001"]
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

settings.corporafolders.novels = {
	title : "Skönlitteratur",
	contents : ["strindbergromaner", "romi", "romii", "rom99", "storsuc", "romg"]
};

settings.corporafolders.newspapertexts = {
	title : "Tidningstexter",
	contents : ["dn1987", "ordat"]
};

settings.corporafolders.newspapertexts.gp = {
	title : "GP",
	contents : ["gp1994", "gp2001", "gp2002", "gp2003", "gp2004", "gp2005", "gp2006", "gp2007", "gp2008", "gp2009", "gp2010", "gp2011", "gp2d"]
};

settings.corporafolders.newspapertexts.press = {
	title : "Press",
	contents : ["press65", "press76", "press95", "press96", "press97", "press98"]
};

settings.corporafolders.magazines = {
	title : "Tidskrifter",
	contents : ["fof"]
};

/*
 * CORPORA
 */

settings.corpora.fsbbloggvuxna = {
	title : "Vuxna bloggare",
	description : "",
	languages : {
		FSBBLOGGVUXNA : "svenska"
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
		post_title : {label : "post_title"},
		post_date : {label : "date"},
		post_tags : {label : "tags", type : "set"},
		post_url : {label : "post_url", type : "url"}
	}
};

settings.corpora.fsbskonlit = {
	title : "Skönlitteratur 1970–2011",
	description : "Material ur skönlitterära verk publicerade under 1970–2011 av Söderströms förlag.",
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
	title : "Essäistisk litteratur 1970–2011",
	description : "Material ur essäistiska verk publicerade under 1970–2011 av Söderströms förlag.",
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
	title : "Sakprosa 1970–2011",
	description : "Material ur facklitterära verk publicerade under 1970–2011 av Söderströms förlag och Svenska litteratursällskapets förlag.",
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

settings.corpora.lagtexter = {
	title : "Lagtexter 1990–2000",
	description : "Material ur Finlands lag.",
	languages : {
		LAGTEXTER : "svenska"
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

settings.corpora.myndighet = {
	title : "Myndighetsprosa 1990–2000",
	description : "Material ur bland annat Utbildningsstyrelsens, Undervisningsministeriets och Länsstyrelsens publikationer.",
	languages : {
		MYNDIGHET : "svenska"
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

settings.corpora.hanken = {
	title : "Hanken 2008–2011",
	description : "Tidningen <a href=\"http://www.hanken.fi/public/alumntidning\">Hanken</a> är Svenska handelshögskolans alumntidning.",
	languages : {
		HANKEN : "svenska"
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

settings.corpora.svenskbygden = {
	title : "Svenskbygden 2010–2011",
	description : "<a href=\"http://www.sfv.fi/publikationer/svenskbygden/\">Svenskbygden</a> är Svenska Folkskolans Vänners medlemstidning. Tiskriften innehåller artiklar som berör allt från utbildning och aktuella samhällsfrågor till kultur och litteratur.",
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

settings.corpora.studentbladet = {
	title : "Studentbladet 2011",
	description : "<a href=\"http://www.stbl.fi\">Studentbladet</a> är en tidskrift som bevakar samtliga svenskspråkiga studieorter på fastlandet i Finland.",
	languages : {
		STUDENTBLADET : "svenska"
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
	description : "Jakobstads Tidning var en lokal dagstidning i Österbotten som gavs ut under perioden 1898–2008.",
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
	description : "Jakobstads Tidning var en lokal dagstidning i Österbotten som gavs ut under perioden 1898–2008.",
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

settings.corpora.sweachum = {
	title : "Humaniora",
	description : "",
	languages : {
		SWEACHUM : "svenska"
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
	    text_type : {label : "type"},
	    text_subject : {label : "subject"}
	}
};

settings.corpora.dn1987 = {
	title : "DN 1987",
	description : "Dagens Nyheter 1987.",
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
	description : "Göteborgs-Posten 1994.",
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
	description : "Göteborgs-Posten 2001.",
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
	description : "Göteborgs-Posten 2002.",
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
	description : "Göteborgs-Posten 2003.",
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
	description : "Göteborgs-Posten 2004.",
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
	description : "Göteborgs-Posten 2005.",
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
	description : "Göteborgs-Posten 2006.",
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
	description : "Göteborgs-Posten 2007.",
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
	description : "Göteborgs-Posten 2008.",
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
	description : "Göteborgs-Posten 2009.",
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

settings.corpora.gp2010 = {
	title : "GP 2010",
	description : "Göteborgs-Posten 2010.",
	languages : {
		GP2010 : "svenska"
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

settings.corpora.gp2011 = {
	title : "GP 2011",
	description : "Göteborgs-Posten 2011.",
	languages : {
		GP2010 : "svenska"
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
	title : "GP – Två dagar",
	description : "Helgbilaga till Göteborgs-Posten.",
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
	title : "ORDAT: Svenska dagbladets årsbok 1923–1958",
	description : "25 årgångar av Svenska Dagbladets årsbok, 1923–45, 1948 och 1958.",
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
	title : "Forskning & Framsteg",
	description : "Artiklar från tidskriften Forskning & Framsteg, nummer 7, 1992 till och med nummer 8, 1996.",
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
	description : "Tidningsartiklar från Göteborgs Handels- och Sjöfartstidning, Svenska Dagbladet, Stockholmstidningen, Dagens Nyheter och Sydsvenska Dagbladet.",
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
	description : "Tidningsartiklar från Göteborgs Handels- och Sjöfartstidning, Svenska Dagbladet, Stockholmstidningen, Dagens Nyheter och Sydsvenska Dagbladet.",
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
	description : "Tidningsartiklar från Arbetet, Dagens Nyheter, Göteborgs-Posten, Svenska Dagbladet och Sydsvenskan.",
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
	description : "Tidningsartiklar från Göteborgs-Posten och Svenska Dagbladet.",
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
	description : "Tidningsartiklar från DN, Göteborgs-Posten och Svenska Dagbladet.",
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
	description : "Tidningsartiklar från DN, Göteborgs-Posten och Svenska Dagbladet.",
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

settings.corpora.strindbergbrev = {
	title : "August Strindbergs brev",
	description : "Samtliga tryckta och otryckta brev som var tillgängliga 1 augusti 1991.",
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

settings.corpora.bloggmix = {
	title : "Bloggmix (januari 2012)",
	description : "Material från ett urval av svenska bloggar. Uppdateras regelbundet.",
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
		blog_city : {label : "city", displayType : "select", dataset : {
            "Alingsås" : "Alingsås",
            "Alnö" : "Alnö",
            "Arboga" : "Arboga",
            "Arild" : "Arild",
            "Bankeryd" : "Bankeryd",
            "Bergviken" : "Bergviken",
            "Birsta" : "Birsta",
            "Bjursås" : "Bjursås",
            "Boden" : "Boden",
            "Bohus" : "Bohus",
            "Borgholm" : "Borgholm",
            "Borlänge" : "Borlänge",
            "Borås" : "Borås",
            "Brunflo" : "Brunflo",
            "Brynäs" : "Brynäs",
            "Bygdeå" : "Bygdeå",
            "Danholn" : "Danholn",
            "Deje" : "Deje",
            "Djurslöv" : "Djurslöv",
            "Enköping" : "Enköping",
            "Enskede" : "Enskede",
            "Eriksberg" : "Eriksberg",
            "Eskilstuna" : "Eskilstuna",
            "Falun" : "Falun",
            "Finspång" : "Finspång",
            "Frösö" : "Frösö",
            "Färjestaden" : "Färjestaden",
            "Fårbo" : "Fårbo",
            "Gimo" : "Gimo",
            "Gnesta" : "Gnesta",
            "Granlo" : "Granlo",
            "Grebo" : "Grebo",
            "Grums" : "Grums",
            "Grycksbo" : "Grycksbo",
            "Gryta" : "Gryta",
            "Gränna" : "Gränna",
            "Gustafs" : "Gustafs",
            "Gävle" : "Gävle",
            "Göteborg" : "Göteborg",
            "Habo" : "Habo",
            "Haga" : "Haga",
            "Hallstahammar" : "Hallstahammar",
            "Handen" : "Handen",
            "Hedemora" : "Hedemora",
            "Helsingborg" : "Helsingborg",
            "Hillared" : "Hillared",
            "Hille" : "Hille",
            "Holmsund" : "Holmsund",
            "Hortlax" : "Hortlax",
            "Huddinge" : "Huddinge",
            "Huskvarna" : "Huskvarna",
            "Höganäs" : "Höganäs",
            "Högsby" : "Högsby",
            "Hönö" : "Hönö",
            "Irsta" : "Irsta",
            "Järna" : "Järna",
            "Jönköping" : "Jönköping",
            "Kalmar" : "Kalmar",
            "Karlskoga" : "Karlskoga",
            "Karlstad" : "Karlstad",
            "Kimstad" : "Kimstad",
            "Kinna" : "Kinna",
            "Klippan" : "Klippan",
            "Kristinehamn" : "Kristinehamn",
            "Krokek" : "Krokek",
            "Kumla" : "Kumla",
            "Kungsbacka" : "Kungsbacka",
            "Kungsholmen" : "Kungsholmen",
            "Kungälv" : "Kungälv",
            "Köping" : "Köping",
            "Landskrona" : "Landskrona",
            "Laxå" : "Laxå",
            "Lerum" : "Lerum",
            "Lidingö" : "Lidingö",
            "Lilla Alby" : "Lilla Alby",
            "Lillån" : "Lillån",
            "Limhamn" : "Limhamn",
            "Lindesberg" : "Lindesberg",
            "Lindsdal" : "Lindsdal",
            "Linköping" : "Linköping",
            "Ljunga" : "Ljunga",
            "Lomma" : "Lomma",
            "Luleå" : "Luleå",
            "Lund" : "Lund",
            "Löberöd" : "Löberöd",
            "Malmö" : "Malmö",
            "Mariefred" : "Mariefred",
            "Mjölby" : "Mjölby",
            "Motala" : "Motala",
            "Mullsjö" : "Mullsjö",
            "Mölnbo" : "Mölnbo",
            "Mönsterås" : "Mönsterås",
            "Mörbylånga" : "Mörbylånga",
            "Nacka" : "Nacka",
            "Nacksta" : "Nacksta",
            "Nolhaga" : "Nolhaga",
            "Nora" : "Nora",
            "Norrköping" : "Norrköping",
            "Norrtälje" : "Norrtälje",
            "Nässjö" : "Nässjö",
            "Oskarshamn" : "Oskarshamn",
            "Partille" : "Partille",
            "Piteå" : "Piteå",
            "Pålsjö" : "Pålsjö",
            "Ransta" : "Ransta",
            "Rosvik" : "Rosvik",
            "Rutvik" : "Rutvik",
            "Ryd" : "Ryd",
            "Röbäck" : "Röbäck",
            "Sala" : "Sala",
            "Sandhult" : "Sandhult",
            "Sandskogen" : "Sandskogen",
            "Sandviken" : "Sandviken",
            "Sigtuna" : "Sigtuna",
            "Sjöbo" : "Sjöbo",
            "Skanör med Falsterbo" : "Skanör med Falsterbo",
            "Skellefteå" : "Skellefteå",
            "Skeppsvik" : "Skeppsvik",
            "Skurholmsstaden" : "Skurholmsstaden",
            "Skönsmon" : "Skönsmon",
            "Smedby" : "Smedby",
            "Smedslätten" : "Smedslätten",
            "Sollentuna" : "Sollentuna",
            "Staffanstorp" : "Staffanstorp",
            "Stockholm" : "Stockholm",
            "Stora Vickleby" : "Stora Vickleby",
            "Storvreta" : "Storvreta",
            "Strålsnäs" : "Strålsnäs",
            "Sundsvall" : "Sundsvall",
            "Svedala" : "Svedala",
            "Säffle" : "Säffle",
            "Särö" : "Särö",
            "Säter" : "Säter",
            "Sävar" : "Sävar",
            "Sävedalen" : "Sävedalen",
            "Södermalm" : "Södermalm",
            "Södertälje" : "Södertälje",
            "Södra Möckleby" : "Södra Möckleby",
            "Sörby" : "Sörby",
            "Tallboda" : "Tallboda",
            "Tierp" : "Tierp",
            "Torvalla" : "Torvalla",
            "Tranemo" : "Tranemo",
            "Trelleborg" : "Trelleborg",
            "Trollhättan" : "Trollhättan",
            "Trosa" : "Trosa",
            "Tuve" : "Tuve",
            "Ulricehamn" : "Ulricehamn",
            "Umeå" : "Umeå",
            "Uppsala" : "Uppsala",
            "Vadstena" : "Vadstena",
            "Vagnhärad" : "Vagnhärad",
            "Valbo" : "Valbo",
            "Vaplan" : "Vaplan",
            "Vasastaden" : "Vasastaden",
            "Vejbystrand" : "Vejbystrand",
            "Vellinge" : "Vellinge",
            "Vimmerby" : "Vimmerby",
            "Västerljung" : "Västerljung",
            "Västerås" : "Västerås",
            "Åre" : "Åre",
            "Årsunda" : "Årsunda",
            "Älvkarleby" : "Älvkarleby",
            "Ängelholm" : "Ängelholm",
            "Örebro" : "Örebro",
            "Östermalm" : "Östermalm",
            "Östersund" : "Östersund",
            "Övre Ullerud" : "Övre Ullerud"
		}},
		//blog_categories : {label : "title", type : "set"},
		post_title : {label : "post_title"},
		post_date : {label : "date"},
		post_tags : {label : "tags", type : "set"},
		post_url : {label : "post_url", type : "url"}
	}
};

settings.corpora.drama = {
	title : "Dramawebben (demo)",
	description : "",
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


settings.corpora.lasbart = {
	title : "LäSBarT – Lättläst svenska och barnbokstext",
	description : "",
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

settings.corpora.parole = {
	title : "PAROLE",
	description : "Material insamlat inom ramen för EU-projektet PAROLE. Innehåller romaner, dagstidningar, tidskrifter och webbtexter.",
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

settings.corpora.psalmboken = {
	title : "Psalmboken (1937)",
	description : "",
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

settings.corpora.snp7879 = {
	title : "SNP 78–79 (Riksdagens snabbprotokoll)",
	description : "Riksdagens snabbprotokoll 1978–1979.",
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

settings.corpora.suc2 = {
	title : "SUC 2.0",
	description : "Stockholm-Umeå Corpus",
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
	description : "En samling romaner och andra böcker som har använts i urvalet till SUC. 58 böcker ingår.",
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


settings.corpora.saltnld_swe = {
	title: "Svenska-nederländska", 
	description : "En samling parallella korpusar (svenska-nederländska), bestående av följande subkorpusar:\
<ul>\
<li>Bergman, Ingmar: Laterna magica</li>\
<li>Claus, Hugo: Rykten / De geruchten</li>\
<li>Dekker, Rudolf och van de Pol, Lotte: Kvinnor i manskläder / Vrouwen en mannekleren</li>\
<li>Ekman, Kerstin: Händelser vid vatten / Zwart water</li>\
<li>Froman, Ingmarie: Sverige och Belgien / Zweden und Belgiê</li>\
<li>Guillou, Jan: Fiendens fiende / De vijand van de vijand</li>\
<li>Gustafsson, Lars: En kakesättares eftermiddag / De namiddag van een tegelzetter</li>\
<li>Johanisson, Karin: Den mörka kontinenten / Het duistere continent</li>\
<li>Krabbé, Tim: De försvunna / Het gouden ei</li>\
<li>Mankell, Henning: Mördare utan ansikte / Moordenaar zonder gezicht</li>\
<li>Mulish, Harry: Överfallet / De aanslag</li>\
<li>Nilson, Peter: Hem till jorden / Terug naar de aarde</li>\
<li>van Paemel, Monika: Den första stenen / De eersten steen</li>\
<li>Sjöwall, Maj och Wahlöö, Per: Brandbilen som försvann / De brandweerauto die verdween</li>\
<li>Swartz, Richard: Room service</li>\
<li>Tunström, Göran: Tjuven / Die dief</li>\
<li>Wolkers, Jan: Turkisk konfekt / Turks fruit</li>\
</ul>\
\
Meningarna i korpusarna är sorterade i slumpvis ordning, för att man inte ska kunna återskapa originalet.",
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
	}
};

settings.corpora.europarlda_sv = {
	title: "Svenska-danska", 
	description : "Texter från Europaparlamentets webbsida.",
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

settings.corpora.diabetolog = {
	title : "DiabetologNytt (1996–1999)",
	description : "",
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

settings.corpora.lt1996 = {
	title : "Läkartidningen 1996",
	description : "Läkartidningens publicerade artiklar under 1996.<br/>Antal artiklar: 2345",
	languages : {
		LT1996 : "svenska"
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

settings.corpora.lt1997 = {
	title : "Läkartidningen 1997",
	description : "Läkartidningens publicerade artiklar under 1997.",
	languages : {
		LT1997 : "svenska"
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

settings.corpora.lt1998 = {
	title : "Läkartidningen 1998",
	description : "Läkartidningens publicerade artiklar under 1998.",
	languages : {
		LT1998 : "svenska"
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

settings.corpora.lt1999 = {
	title : "Läkartidningen 1999",
	description : "Läkartidningens publicerade artiklar under 1999.",
	languages : {
		LT1999 : "svenska"
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

settings.corpora.lt2000 = {
	title : "Läkartidningen 2000",
	description : "Läkartidningens publicerade artiklar under 2000.",
	languages : {
		LT2000 : "svenska"
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

settings.corpora.lt2001 = {
	title : "Läkartidningen 2001",
	description : "Läkartidningens publicerade artiklar under 2001.",
	languages : {
		LT2001 : "svenska"
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

settings.corpora.smittskydd = {
	title : "Smittskydd",
	description : "Smittskyddsinstitutets tidskrift, årgångarna 2002–2010.",
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

settings.corpora.vivill = {
	title : "Svenska partiprogram och valmanifest 1887–2010",
	description : "",
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

settings.corpora.strindbergromaner = {
	title : "August Strindbergs samlade verk",
	description : "August Strindbergs samlade verk. Innehåller material från de 59 volymer som utgivits fram till år 2003.",
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

settings.corpora.romi = {
	title : "Bonniersromaner I (1976–77)",
	description : "69 romaner utgivna 1976–77.",
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
	title : "Bonniersromaner II (1980–81)",
	description : "60 romaner från 1980–81.",
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
	description : "",
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
		text_title : {label : "title"}
	}
};

settings.corpora.rom99 = {
	title : "Norstedtsromaner (1999)",
    description : "23 romaner utgivna 1999 på Norstedts förlag.",
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

settings.corpora.sfs = {
	title : "Svensk författningssamling 1978–1981",
	description : "",
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

settings.corpora.wikipedia = {
	title : "Svenska Wikipedia (januari 2012)",
	description : "Samtliga artikar från svenska Wikipedia. Uppdateras regelbundet.",
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

settings.corpora.swewac = {
	title : "SweWaC – Swedish Web as Corpus",
	description : "",
	languages : {
		SWEWAC : "svenska"
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

settings.corpora.astranova = {
	title : "Astra Nova 2008–2010",
	description : "<a href=\"http://www.astranova.fi\">Astra Nova</a> är en tidskrift med feministisk prägel. Innehåller samtliga nummer av Astra Nova från perioden 2008–2010 med artiklar av finlandssvenska skribenter. Artiklar av utländska skribenter ingår inte i materialet, utan är bortplockade.",
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
	title : "Källan 2008–2010",
	description : "<a href=\"http://www.sls.fi/kallan\">Källan</a> är Svenska litteratursällskapets tidskrift.",
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

settings.corpora.meddelanden = {
	title : "Meddelanden från Åbo Akademi 2002–2010",
	description : "<a href=\"http://www.abo.fi/meddelanden\">Meddelanden från Åbo Akademi</a> är Åbo Akademis tidning för extern och intern information. Materialet består av artiklar skrivna av redaktörerna Peter Sandström och Michael Karlsson",
	languages : {
		MEDDELANDEN : "svenska"
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
	title : "Nya Argus 2010–2011",
	description : "<a href=\"http://www.kolumbus.fi/nya.argus/\">Nya Argus</a> är en tidskrift som bevakar kultur, samhälle och debatt. Artiklar skrivna av utländska skribenter är bortplockade.",
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

settings.corpora.pargaskungorelser = {
	title : "Pargas Kungörelser 2011",
	description : "<a href=\"http://www.pku.fi\">Pargas Kungörelser</a> är en regional svenskspråkig tidning i Pargas med omnejd.",
	languages : {
		PARGASKUNGORELSER : "svenska"
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
	description : "<a href=\"http://www.vasabladet.fi\">Vasabladet</a> är en regional svenskspråkig dagstidning i Österbotten.",
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

settings.corpora.osterbottenstidning2011 = {
	title : "Österbottens tidning 2011",
	description : "",
	languages : {
		OSTERBOTTENSTIDNING2011 : "svenska"
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
	}
};

settings.corpora.fnb1999 = {
	title : "FNB 1999",
	description : "<a href=\"http://www.stt.fi/sv\">FNB</a> är Finlands ledande nyhets- och bildbyrå.",
	languages : {
		FNB1999 : "svenska"
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
	}
};

settings.corpora.fnb2000 = {
	title : "FNB 2000",
	description : "<a href=\"http://www.stt.fi/sv\">FNB</a> är Finlands ledande nyhets- och bildbyrå.",
	languages : {
		FNB2000 : "svenska"
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
	}
};

settings.corpora.hbl1991 = {
	title : "Hufvudstadsbladet 1991",
	description : "<a href=\"http://www.hbl.fi\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland.",
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
	description : "<a href=\"http://www.hbl.fi\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland.",
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
	description : "<a href=\"http://www.hbl.fi\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland.",
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

// label values here represent translation keys.
settings.arg_groups = {
	"word" : {
		word : {label : "word"},
		anyword : {label : "any", opts : {}}
	}
};


settings.inner_args = {
	anyword : function(s) {
		return "";
	}
};

delete attrs;
delete sattrs;
delete within;
delete context;
delete ref;
