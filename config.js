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
settings.secondaryColor = "";
settings.corpora = {};
settings.defaultContext = {
	"1 sentence" : "1 sentence"
};
settings.spContext = {
	"1 sentence" : "1 sentence",
	"1 paragraph" : "1 paragraph"
};
settings.defaultWithin = {
	"sentence" : "sentence"	
};
settings.spWithin = {
	"sentence" : "sentence",
	"paragraph" : "paragraph"
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
	"contains" : "contains",
	"ends_with" : "ends_with",
	"matches" : "matches"
};

settings.getTransformFunc = function(type, value, opt) {
	c.log("getTransformFunc", type, value);
	
	if(type == "word" && !value) return function() {return "";};
	
	if(type == "date_interval") {
		
		var from = value[0].toString() + "0101";
		var to = value[1].toString() + "1231";
		
		var operator1 = ">=", operator2 = "<=", bool = "&";
		if(opt == "is_not") {
			operator1 = "<";
			operator2 = ">";
			bool = "|";
		}
		
		return function() {
			return $.format("(int(_.text_datefrom) %s %s %s int(_.text_dateto) %s %s)", 
					[operator1, from, bool, operator2, to]);
		};
	
	}
};

settings.liteOptions = $.exclude(settings.defaultOptions, ["starts_with", "contains", "ends_with", "matches"]);

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
sattrs.date = {
	label : "date",
	displayType : "date"
};

/*
 * FOLDERS
 */
 
settings.corporafolders = {};

settings.corporafolders.sweac = {
	title : "Akademiska texter",
	contents : ["sweachum"]
};

settings.corporafolders.strindberg = {
		title : "August Strindberg",
		contents : ["strindbergromaner", "strindbergbrev"]
};
settings.corporafolders.fisk = {
	title : "Finlandssvenska texter",
	contents : ["magmakolumner"],
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
	contents : ["lagtexter", "myndighet", "myndighet2"]
};

settings.corporafolders.fisk.novels = {
	title : "Skönlitteratur",
	contents : ["fsbskonlit"]
};

settings.corporafolders.fisk.newspapertexts = {
	title : "Tidningstexter",
	contents : ["sydosterbotten2012", "abounderrattelser2012", "at2012"]
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

settings.corporafolders.fisk.newspapertexts.pargaskungorelser = {
	title : "Pargas kungörelser",
	contents : ["pargaskungorelser2011", "pargaskungorelser2012"],
	description : "Pargas Kungörelser är en regional svenskspråkig tidning i Pargas med omnejd."
	// http://www.pku.fi
};

settings.corporafolders.fisk.newspapertexts.vasab = {
	title : "Vasabladet",
	contents : ["vasabladet1991", "vasabladet2012"],
	description : "Vasabladet är en regional svenskspråkig dagstidning i Österbotten."
	//description : "<a href=\"http://www.vasabladet.fi\">Vasabladet</a> är en regional svenskspråkig dagstidning i Österbotten."
};

settings.corporafolders.fisk.newspapertexts.osterbottenstidning = {
	title : "Österbottens tidning",
	contents : ["osterbottenstidning2011", "osterbottenstidning2012"],
	description : ""
};

settings.corporafolders.fisk.magazines = {
	title : "Tidskrifter",
	contents : ["astranova", "finsktidskrift", "hanken", "kallan", "meddelanden", "nyaargus", "studentbladet", "svenskbygden"]
};

settings.corporafolders.medical = {
	title : "Medicinska texter",
	contents : ["diabetolog", "smittskydd"]
};

settings.corporafolders.medical.ltd = {
	title : "Läkartidningen",
	contents : ["lt1996", "lt1997", "lt1998", "lt1999", "lt2000", "lt2001", "lt2002", "lt2003", "lt2004", "lt2005"]
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
	contents : ["romi", "romii", "rom99", "storsuc", "romg"]
};

settings.corporafolders.newspapertexts = {
	title : "Tidningstexter",
	contents : ["attasidor", "dn1987", "ordat"]
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

settings.corpora.magmakolumner = {
	id : "magmakolumner",
	title : "Magma kolumner",
	description : "Material ur kolumner publicerade av <a href=\"http://www.magma.fi\">Tankesmedjan Magma</a>",
	within : settings.spWithin,
	context : settings.spContext,
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
	    text_date : {label : "date"}
	}
};

settings.corpora.fsbbloggvuxna = {
	id : "fsbbloggvuxna",
	title : "Vuxna bloggare",
	description : "",
	within : settings.spWithin,
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
		blog_title : {label : "blog_title"},
		blog_url : {label : "blog_url", type : "url"},
		blog_age : {label : "author_age"},
		blog_city : {label : "city"},
		text_title : {label : "post_title"},
		text_date : {label : "date"},
		text_tags : {label : "tags", type : "set"},
		text_url : {label : "post_url", type : "url"}
	}
};

settings.corpora.fsbskonlit = {
	id : "fsbskonlit",
	title : "Skönlitteratur 1970–2011",
	description : "Material ur skönlitterära verk publicerade under 1970–2011 av Söderströms förlag.",
	within : settings.spWithin,
	context : settings.spContext,
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
	    text_date : {label : "year"},
	    text_publisher : {label : "publisher"}
	}
};

settings.corpora.fsbessaistik = {
	id : "fsbessaistik",
	title : "Essäistisk litteratur 1970–2011",
	description : "Material ur essäistiska verk publicerade under 1970–2011 av Söderströms förlag.",
	within : settings.spWithin,
	context : settings.spContext,
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
	    text_date : {label : "year"},
	    text_publisher : {label : "publisher"}
	}
};

settings.corpora.fsbsakprosa = {
	id : "fsbsakprosa",
	title : "Sakprosa 1970–2011",
	description : "Material ur facklitterära verk publicerade under 1970–2011 av Söderströms förlag och Svenska litteratursällskapets förlag.",
	within : settings.spWithin,
	context : settings.spContext,
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
	    text_date : {label : "year"},
	    text_publisher : {label : "publisher"}
	}
};

settings.corpora.lagtexter = {
	id : "lagtexter",
	title : "Lagtexter 1990–2000",
	description : "Material ur Finlands lag.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "myndighet",
	title : "Myndighetsprosa 1990–2000",
	description : "Material ur bland annat Utbildningsstyrelsens, Undervisningsministeriets och Länsstyrelsens publikationer.",
	within : settings.spWithin,
	context : settings.spContext,
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

settings.corpora.myndighet2 = {
	id : "myndighet2",
	title : "Myndighetsprosa 2001–2012",
	description : "Material utgivet av offentliga myndigheter.",
	within : settings.spWithin,
	context : settings.spContext,
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
		text_date : {label : "year"},
		text_publisher : {label : "publisher"},
		text_title : {label : "title"}
	}
};

settings.corpora.finsktidskrift = {
	id : "finsktidskrift",
	title : "Finsk tidskrift 2011–2012",
	description : "<a href=\"http://www.abo.fi/public/finsktidskrift\">Finsk Tidskrift</a> är en tidskrift som strävar efter ingående reflektion inom ett brett område och vill ge djupare historisk, politisk och kulturell förståelse av den aktuella samtidsdebatten.",
	within : settings.spWithin,
	context : settings.spContext,
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
	    text_date : {label : "year"},
	    text_issue : {label : "issue"}
	}
};

settings.corpora.hanken = {
	id : "hanken",
	title : "Hanken 2008–2011",
	description : "Tidningen <a href=\"http://www.hanken.fi/public/alumntidning\">Hanken</a> är Svenska handelshögskolans alumntidning.",
	within : settings.spWithin,
	context : settings.spContext,
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
	    text_date : {label : "year"},
	    text_issue : {label : "issue"}
	}
};

settings.corpora.svenskbygden = {
	id : "svenskbygden",
	title : "Svenskbygden 2010–2011",
	description : "<a href=\"http://www.sfv.fi/publikationer/svenskbygden/\">Svenskbygden</a> är Svenska Folkskolans Vänners medlemstidning. Tiskriften innehåller artiklar som berör allt från utbildning och aktuella samhällsfrågor till kultur och litteratur.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "studentbladet",
	title : "Studentbladet 2011",
	description : "<a href=\"http://www.stbl.fi\">Studentbladet</a> är en tidskrift som bevakar samtliga svenskspråkiga studieorter på fastlandet i Finland.",
	within : settings.spWithin,
	context : settings.spContext,
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
	    text_date : {label : "year"},
	    text_issue : {label : "issue"}
	}
};

settings.corpora.jakobstadstidning1999 = {
	id : "jakobstadstidning1999",
	title : "Jakobstads tidning 1999",
	description : "Jakobstads Tidning var en lokal dagstidning i Österbotten som gavs ut under perioden 1898–2008.",
	within : settings.spWithin,
	context : settings.spContext,
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
		text_date : {label : "date"}
	}
};

settings.corpora.jakobstadstidning2000 = {
	id : "jakobstadstidning2000",
	title : "Jakobstads tidning 2000",
	description : "Jakobstads Tidning var en lokal dagstidning i Österbotten som gavs ut under perioden 1898–2008.",
	within : settings.spWithin,
	context : settings.spContext,
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
		text_date : {label : "date"}
	}
};

settings.corpora.sweachum = {
	id : "sweachum",
	title : "Humaniora",
	description : "",
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
	    text_type : {label : "type"},
	    text_subject : {label : "subject"}
	}
};

settings.corpora.attasidor = {
	id : "attasidor",
	title : "8 SIDOR",
	description : "<a href=\"http://www.8sidor.se/\">8 SIDOR</a> är en lättläst nyhetstidning.",
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
		text_date : sattrs.date,
		text_title : {label : "title"}
	}
};

settings.corpora.dn1987 = {
	id : "dn1987",
	title : "DN 1987",
	description : "Dagens Nyheter 1987.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp1994",
	title : "GP 1994",
	description : "Göteborgs-Posten 1994.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2001",
	title : "GP 2001",
	description : "Göteborgs-Posten 2001.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2002",
	title : "GP 2002",
	description : "Göteborgs-Posten 2002.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2003",
	title : "GP 2003",
	description : "Göteborgs-Posten 2003.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2004",
	title : "GP 2004",
	description : "Göteborgs-Posten 2004.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2005",
	title : "GP 2005",
	description : "Göteborgs-Posten 2005.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2006",
	title : "GP 2006",
	description : "Göteborgs-Posten 2006.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2007",
	title : "GP 2007",
	description : "Göteborgs-Posten 2007.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2008",
	title : "GP 2008",
	description : "Göteborgs-Posten 2008.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2009",
	title : "GP 2009",
	description : "Göteborgs-Posten 2009.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2010",
	title : "GP 2010",
	description : "Göteborgs-Posten 2010.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2011",
	title : "GP 2011",
	description : "Göteborgs-Posten 2011.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "gp2d",
	title : "GP – Två dagar",
	description : "Helgbilaga till Göteborgs-Posten.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "ordat",
	title : "ORDAT: Svenska dagbladets årsbok 1923–1958",
	description : "25 årgångar av Svenska Dagbladets årsbok, 1923–45, 1948 och 1958.",
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
		text_date : {label : "text_year"},
		text_volume : {label : "text_volume"}
	}
};

settings.corpora.fof = {
	id : "fof",
	title : "Forskning & Framsteg",
	description : "Artiklar från tidskriften Forskning & Framsteg, nummer 7, 1992 till och med nummer 8, 1996.",
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
		text_issue : {label : "issue"}
	}
};

settings.corpora.press65 = {
	id : "press65",
	title : "Press 65",
	description : "Tidningsartiklar från Göteborgs Handels- och Sjöfartstidning, Svenska Dagbladet, Stockholmstidningen, Dagens Nyheter och Sydsvenska Dagbladet.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "press76",
	title : "Press 76",
	description : "Tidningsartiklar från Göteborgs Handels- och Sjöfartstidning, Svenska Dagbladet, Stockholmstidningen, Dagens Nyheter och Sydsvenska Dagbladet.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "press95",
	title : "Press 95",
	description : "Tidningsartiklar från Arbetet, Dagens Nyheter, Göteborgs-Posten, Svenska Dagbladet och Sydsvenskan.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "press96",
	title : "Press 96",
	description : "Tidningsartiklar från Göteborgs-Posten och Svenska Dagbladet.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "press97",
	title : "Press 97",
	description : "Tidningsartiklar från DN, Göteborgs-Posten och Svenska Dagbladet.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "press98",
	title : "Press 98",
	description : "Tidningsartiklar från DN, Göteborgs-Posten och Svenska Dagbladet.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "strindbergbrev",
	title : "August Strindbergs brev",
	description : "Samtliga tryckta och otryckta brev som var tillgängliga 1 augusti 1991.",
	within : settings.spWithin,
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
		text_author : {label : "author"},
		text_recipient : {label : "text_recipient"},
		text_year : {label : "year"},
		text_month : {label : "month"},
		text_day : {label : "day"},
		text_volume : {label : "text_volume"}
	}
};

settings.corpora.bloggmix = {
	id : "bloggmix",
	title : "Bloggmix (augusti 2012)",
	description : "Material från ett urval av svenska bloggar. Uppdateras regelbundet.",
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
		blog_title : {label : "blog_title"},
		blog_url : {label : "blog_url", type : "url"},
		blog_age : {label : "author_age"},
		blog_city : {
			label : "city", 
			displayType : "select",
			localize : false,
			dataset : {
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
		text_title : {label : "post_title"},
		text_date : {label : "date"},
		text_tags : {label : "tags", type : "set"},
		text_url : {label : "post_url", type : "url"}
	}
};

settings.corpora.drama = {
	id : "drama",
	title : "Dramawebben (demo)",
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
	struct_attributes : {}
};


settings.corpora.lasbart = {
	id : "lasbart",
	title : "LäSBarT – Lättläst svenska och barnbokstext",
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
		text_source : {label : "source"},
		text_type : {label : "type"},
		text_date : {label : "date"},
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_age : {label : "age"}
	}
};

settings.corpora.parole = {
	id : "parole",
	title : "PAROLE",
	description : "Material insamlat inom ramen för EU-projektet PAROLE. Innehåller romaner, dagstidningar, tidskrifter och webbtexter.",
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
		text_id : {label : "text"},
		text_date : {label : "date"},
		text_title : {label : "title"},
		text_publisher : {label : "publisher"},
	}
};

settings.corpora.psalmboken = {
	id : "psalmboken",
	title : "Psalmboken (1937)",
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
		text_year : {label : "year"}
	}
};

settings.corpora.snp7879 = {
	id : "snp7879",
	title : "SNP 78–79 (Riksdagens snabbprotokoll)",
	description : "Riksdagens snabbprotokoll 1978–1979.",
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
	struct_attributes : {}
};

settings.corpora.suc2 = {
	id : "suc2",
	title : "SUC 2.0",
	description : "Stockholm-Umeå Corpus",
	within : settings.defaultWithin,
	context : {
		"1 sentence" : "1 sentence"
	},
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
	id : "storsuc",
	title : "SUC-romaner",
	description : "En samling romaner och andra böcker som har använts i urvalet till SUC. 58 böcker ingår.",
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
	id : "saltnld_swe",
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
	context: settings.defaultContext, 
	within: settings.defaultWithin, 
	attributes: {
		pos: attrs.pos, 
		msd: attrs.msd, 
		lemma: attrs.baseform,
		lex: attrs.lemgram, 
		saldo: attrs.saldo, 
		dephead: attrs.dephead, 
		deprel: attrs.deprel, 
		ref: attrs.ref, 
	},
	struct_attributes : {
	}
};

settings.corpora.europarlda_sv = {
	id : "europarlda_sv",
	title: "Svenska-danska", 
	description : "Texter från Europaparlamentets webbsida.",
	context: settings.defaultContext, 
	within: settings.defaultWithin, 
	attributes: {
		pos: attrs.pos, 
		msd: attrs.msd, 
		lemma: attrs.baseform,
		lex: attrs.lemgram, 
		saldo: attrs.saldo, 
		dephead: attrs.dephead, 
		deprel: attrs.deprel, 
		ref: attrs.ref, 
	},
	struct_attributes : {
//		text_origlang : {
//			label : "original_language"
//		}
	}
};

settings.corpora.diabetolog = {
	id : "diabetolog",
	title : "DiabetologNytt (1996–1999)",
	description : "",
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
		text_year : {label : "year"},
		text_title : {label : "title"},
		text_source : {label : "url", type : "url"}
	}
};

settings.corpora.lt1996 = {
	id : "lt1996",
	title : "Läkartidningen 1996",
	description : "Läkartidningens publicerade artiklar under 1996.<br/>Antal artiklar: 2345",
	within : settings.defaultWithin,
	context : settings.defaultContext,
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
	    text_year : {label : "year"},
		text_article : {label : "article"},
		text_id : {label : "text"}
	}
};

settings.corpora.lt1997 = {
	id : "lt1997",
	title : "Läkartidningen 1997",
	description : "Läkartidningens publicerade artiklar under 1997.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.lt1998 = {
	id : "lt1998",
	title : "Läkartidningen 1998",
	description : "Läkartidningens publicerade artiklar under 1998.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.lt1999 = {
	id : "lt1999",
	title : "Läkartidningen 1999",
	description : "Läkartidningens publicerade artiklar under 1999.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.lt2000 = {
	id : "lt2000",
	title : "Läkartidningen 2000",
	description : "Läkartidningens publicerade artiklar under 2000.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.lt2001 = {
	id : "lt2001",
	title : "Läkartidningen 2001",
	description : "Läkartidningens publicerade artiklar under 2001.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.lt2002 = {
	id : "lt2002",
	title : "Läkartidningen 2002",
	description : "Läkartidningens publicerade artiklar under 2002.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.lt2003 = {
	id : "lt2003",
	title : "Läkartidningen 2003",
	description : "Läkartidningens publicerade artiklar under 2003.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.lt2004 = {
	id : "lt2004",
	title : "Läkartidningen 2004",
	description : "Läkartidningens publicerade artiklar under 2004.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.lt2005 = {
	id : "lt2005",
	title : "Läkartidningen 2005",
	description : "Läkartidningens publicerade artiklar under 2005.",
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
		text_date : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.smittskydd = {
	id : "smittskydd",
	title : "Smittskydd",
	description : "Smittskyddsinstitutets tidskrift, årgångarna 2002–2010.",
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
		text_year : {label : "year"},
		text_issue : {label : "issue"},
		text_title : {label : "title"}
	}
};

settings.corpora.vivill = {
	id : "vivill",
	title : "Svenska partiprogram och valmanifest 1887–2010",
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
		text_year : {label : "year", displayType : "select",
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
	id : "strindbergromaner",
	title : "August Strindbergs samlade verk",
	description : "August Strindbergs samlade verk. Innehåller material från de 59 volymer som utgivits fram till år 2003.",
	within : settings.spWithin,
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
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_date : {label : "year"},
		text_sv : {label : "text_sv"},
		page_n : {label : "page"}
	}
};

settings.corpora.romi = {
	id : "romi",
	title : "Bonniersromaner I (1976–77)",
	description : "69 romaner utgivna 1976–77.",
	context : settings.spContext,
	within : settings.spWithin,
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
	id : "romii",
	title : "Bonniersromaner II (1980–81)",
	description : "60 romaner från 1980–81.",
	within : settings.spWithin,
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
		text_author : {label : "author"},
		text_title : {label : "title"}
	}
};

settings.corpora.romg = {
	id : "romg",
	title : "Äldre svenska romaner",
	description : "",
	within : settings.spWithin,
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
		text_author : {label : "author"},
		text_title : {label : "title"}
	}
};

settings.corpora.rom99 = {
	id : "rom99",
	title : "Norstedtsromaner (1999)",
    description : "23 romaner utgivna 1999 på Norstedts förlag.",
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
		text_author : {label : "author"},
		text_title : {label : "title"},
		text_year : {label : "year"}
	}
};

settings.corpora.sfs = {
	id : "sfs",
	title : "Svensk författningssamling",
	description : "",
	within : settings.spWithin,
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
		text_title : {label : "title"},
		text_date : {label : "date"}
	}
};

settings.corpora["wikipedia-sv"] = {
	id : "wikipedia-sv",
	title : "Svenska Wikipedia (augusti 2012)",
	description : "Samtliga artikar från svenska Wikipedia. Uppdateras regelbundet.",
	within : settings.spWithin,
	context : settings.spContext,
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
	id : "swewac",
	title : "SweWaC – Swedish Web as Corpus",
	description : "",
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
	}
};

settings.corpora.astranova = {
	id : "astranova",
	title : "Astra Nova 2008–2010",
	description : "<a href=\"http://www.astranova.fi\">Astra Nova</a> är en tidskrift med feministisk prägel. Innehåller samtliga nummer av Astra Nova från perioden 2008–2010 med artiklar av finlandssvenska skribenter. Artiklar av utländska skribenter ingår inte i materialet, utan är bortplockade.",
	within : settings.spWithin,
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
		text_date : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.kallan = {
	id : "kallan",
	title : "Källan 2008–2010",
	description : "<a href=\"http://www.sls.fi/kallan\">Källan</a> är Svenska litteratursällskapets tidskrift.",
	within : settings.spWithin,
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
		text_date : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.meddelanden = {
	id : "meddelanden",
	title : "Meddelanden från Åbo Akademi 2002–2010",
	description : "<a href=\"http://www.abo.fi/meddelanden\">Meddelanden från Åbo Akademi</a> är Åbo Akademis tidning för extern och intern information. Materialet består av artiklar skrivna av redaktörerna Peter Sandström och Michael Karlsson",
	within : settings.spWithin,
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
		text_date : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.nyaargus = {
	id : "nyaargus",
	title : "Nya Argus 2010–2011",
	description : "<a href=\"http://www.kolumbus.fi/nya.argus/\">Nya Argus</a> är en tidskrift som bevakar kultur, samhälle och debatt. Artiklar skrivna av utländska skribenter är bortplockade.",
	within : settings.spWithin,
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
		text_date : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.pargaskungorelser2011 = {
	id : "pargaskungorelser2011",
	title : "Pargas Kungörelser 2011",
	description : "",
	within : settings.spWithin,
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
		text_date : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.pargaskungorelser2012 = {
	id : "pargaskungorelser2012",
	title : "Pargas Kungörelser 2012",
	description : "",
	within : settings.spWithin,
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
		text_date : {label : "year"},
		text_issue : {label : "issue"}
	}
};

settings.corpora.sydosterbotten2012 = {
	id : "sydosterbotten2012",
	title : "Syd-Österbotten 2012",
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
	}
};

settings.corpora.abounderrattelser2012 = {
	id : "abounderrattelser2012",
	title : "Åbo Underrättelser 2012",
	description : "<a href=\"www.abounderrattelser.fi\">Åbo Underrättelser</a> är en regional svenskspråkig dagstidning i Åbotrakten.",
	within : settings.spWithin,
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
	    text_date : {label : "date"}
	}
};


settings.corpora.at2012 = {
	id : "at2012",
	title : "Ålandstidningen 2012",
	description : "<a href=\"http://www.alandstidningen.ax/\">Ålandstidningen</a> är en regional svenskspråkig dagstidning på Åland.",
	within : settings.spWithin,
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
	    text_date : {label : "date"}
	}
};

settings.corpora.vasabladet1991 = {
	id : "vasabladet1991",
	title : "Vasabladet 1991",
	description : "<a href=\"http://www.vasabladet.fi\">Vasabladet</a> är en regional svenskspråkig dagstidning i Österbotten.",
	within : settings.spWithin,
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
		text_type : {label : "section"}
	}
};

settings.corpora.vasabladet2012 = {
	id : "vasabladet2012",
	title : "Vasabladet 2012",
	description : "<a href=\"http://www.vasabladet.fi\">Vasabladet</a> är en regional svenskspråkig dagstidning i Österbotten.",
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
	}
};

settings.corpora.osterbottenstidning2011 = {
	id : "osterbottenstidning2011",
	title : "Österbottens tidning 2011",
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
	}
};

settings.corpora.osterbottenstidning2012 = {
	id : "osterbottenstidning2012",
	title : "Österbottens tidning 2012",
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
	}
};

settings.corpora.fnb1999 = {
	id : "fnb1999",
	title : "FNB 1999",
	description : "<a href=\"http://www.stt.fi/sv\">FNB</a> är Finlands ledande nyhets- och bildbyrå.",
	within : settings.spWithin,
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

settings.corpora.fnb2000 = {
	id : "fnb2000",
	title : "FNB 2000",
	description : "<a href=\"http://www.stt.fi/sv\">FNB</a> är Finlands ledande nyhets- och bildbyrå.",
	within : settings.spWithin,
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

settings.corpora.hbl1991 = {
	id : "hbl1991",
	title : "Hufvudstadsbladet 1991",
	description : "<a href=\"http://www.hbl.fi\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland.",
	within : settings.spWithin,
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
	    text_date : {label : "year"},
	    text_type : {label : "section"}
	}
};

settings.corpora.hbl1998 = {
	id : "hbl1998",
	title : "Hufvudstadsbladet 1998",
	description : "<a href=\"http://www.hbl.fi\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland.",
	within : settings.spWithin,
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
	    text_year : {label : "year"}
	}
};

settings.corpora.hbl1999 = {
	id : "hbl1999",
	title : "Hufvudstadsbladet 1999",
	description : "<a href=\"http://www.hbl.fi\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland.",
	within : settings.spWithin,
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
	    text_year : {label : "year"}
	}
};

settings.corpora.talbanken = {
	id : "talbanken",
	title : "Talbanken",
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
	}
};


settings.corpora.gslc = {
		id : "gslc",
		title : "Göteborg Spoken Language Corpus (GSLC)",
		description : 'GSLC is an incrementally growing corpus of spoken language from different social activities. Based on the fact that spoken language varies considerably in different social activities with regard to pronunciation, vocabulary and grammar, the goal of the corpus is to include spoken language from as many social activities as possible.',
		limited_access : true,
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
			"text_activity1" : {label : "activity1"},
			"text_activity2" : {label : "activity2"},
			"text_activity3" : {label : "activity3"},
			"text_title" : {label : "title"},
			"text_duration" : {label : "duration"},
			"text_project" : {label : "project"},
			"line_speaker" : {label : "speaker"},
			"text_date" : {label : "date"},
			"section_name" : {label : "section"}
		}
	};



/*
 * MISC
 */

settings.cgi_script = "http://spraakbanken.gu.se/ws/korp";

// label values here represent translation keys.
settings.arg_groups = {
	"word" : {
		word : {label : "word"}
	}
};


settings.reduce_stringify = function(type) {
	function filterCorpora(rowObj) {
		return $.grepObj(rowObj, function(value, key) {
			return key != "total_value" && $.isPlainObject(value);
		});
	}
	
	function getCorpora(dataContext) {
		var corpora = $.grepObj(filterCorpora(dataContext), function(value, key) {
			return value.relative != null;
		});
		corpora = $.map($.keys(corpora), function(item) {
			return item.split("_")[0].toLowerCase();
		});
		return corpora;
	}
	
	function appendDiagram(output, corpora, value) {
		if(corpora.length > 1)
			return output + $.format('<img id="circlediagrambutton__%s" src="img/stats2.png" class="arcDiagramPicture"/>', value);
		else
			return output;
	}
	var output = "";
	switch(type) {
	case "word":
		return function(row, cell, value, columnDef, dataContext) {
			var corpora = getCorpora(dataContext);
			if(value == "&Sigma;") return appendDiagram(value, corpora, value);
			
			var query = $.map(dataContext.hit_value.split(" "), function(item) {
				return $.format('[word="%s"]', item);
			}).join(" ");
			
			output = $("<span>", 
					{
					"class" : "link", 
					"data-query" : encodeURIComponent(query), 
					"data-corpora" : $.toJSON(corpora)
					}).text(value).outerHTML();
			return appendDiagram(output, corpora, value);
			 
		}; 
		
	case "pos":
		return function(row, cell, value, columnDef, dataContext) {
			var corpora = getCorpora(dataContext);
			if(value == "&Sigma;") return appendDiagram(value, corpora, value);
			var query = $.map(dataContext.hit_value.split(" "), function(item) {
				return $.format('[pos="%s"]', item);
			}).join(" ");
			output =  $.format("<span class='link' data-query='%s' data-corpora='%s' rel='localize[%s]'>%s</span> ", 
					[query, $.toJSON(corpora), value, util.getLocaleString("pos_" + value)]);
			return appendDiagram(output, corpora, value);
		};
	case "lex":
		return function(row, cell, value, columnDef, dataContext) {
		var corpora = getCorpora(dataContext);
		if(value == "&Sigma;") return appendDiagram(value, corpora, value);
		output = _.chain(value.split("|"))
				.filter(Boolean)
				.map(function(item) {
					return util.lemgramToString(item, true);
				})
				.value().join(", ");
		return appendDiagram(output, corpora, value);
		};
	case "prefix":
	case "suffix":
	case "saldo":
		return function(row, cell, value, columnDef, dataContext) {
		var corpora = getCorpora(dataContext);
		if(value == "&Sigma;") return appendDiagram(value, corpora, value);
		output = _.chain(value.split("|"))
				.filter(Boolean)
				.map(function(item) {
					return util.saldoToString(item, true);
				})
				.value().join(", ");
		return appendDiagram(output, corpora, value);
		};
	case "deprel":
		return function(row, cell, value, columnDef, dataContext) {
			var corpora = getCorpora(dataContext);
			if(value == "&Sigma;") return appendDiagram(value, corpora, value);
			var query = $.map(dataContext.hit_value.split(" "), function(item) {
				return $.format('[deprel="%s"]', item);
			}).join(" ");
			var output = $.format("<span class='link' data-query='%s' data-corpora='%s' rel='localize[%s]'>%s</span> ", 
					[query, $.toJSON(corpora),"deprel_" + value, util.getLocaleString("deprel_" + value)]);
			return appendDiagram(output, corpora, value);
			
		};
	default:
		return function(row, cell, value, columnDef, dataContext) {
			var corpora = getCorpora(dataContext);
			if(value == "&Sigma;") return appendDiagram(output, corpora, value);
			return appendDiagram(output, corpora, value);;
		};
	}
	
	return output;
};


delete attrs;
delete sattrs;
delete context;
delete ref;


var CorpusListing = new Class({
	initialize : function(corpora) {
		this.struct = corpora;
		this.corpora = _.values(corpora);
		this.selected = [];
	},
	
	get : function(key) {
		return this.struct[key];
	},
	
	list : function() {
		return this.corpora;
	},
	
	map : function(func) {
		return _.map(this.corpora, func);
	},
	
	
	/* Returns an array of all the selected corpora's IDs in uppercase */
	getSelectedCorpora : function() {
		return corpusChooserInstance.corpusChooser("selectedItems");
	},
	
	select : function(idArray) {
		this.selected = _.values(_.pick.apply(this, [this.struct].concat(idArray))); 
	},

	mapSelectedCorpora : function(f) {
		return _.map(this.selected, f);
	},
	// takes an array of mapping objs and returns their intersection
	_mapping_intersection : function(mappingArray) {
		return _.reduce(mappingArray, function(a,b) {
			var output = {};
			$.each(b, function(key, value) {
				if(b[key] != null)
					output[key] = value;
			});
			return output;
		}, {});
	},

	_mapping_union : function(mappingArray) {
		return _.reduce(mappingArray, function(a, b) {
			return $.extend({}, a, b);
		}, {});
	},

	getCurrentAttributes : function() {
		var attrs = this.mapSelectedCorpora(function(corpus) {
			return corpus.attributes;
		});
		
		return this._invalidateAttrs(attrs);
		
	},
	getStructAttrs : function() {
		var attrs = this.mapSelectedCorpora(function(corpus) {
			$.each(corpus.struct_attributes, function(key, value) {
				value["isStructAttr"] = true; 
			});
			return corpus.struct_attributes;
		});
		var rest = this._invalidateAttrs(attrs);
		
		// fix for combining dataset values
		var withDataset = _.filter(_.pairs(rest), function(item) {
			return item[1].dataset;
		});
		
		$.each(withDataset, function(i, item) {
			var key = item[0];
			var val = item[1];
			$.each(attrs, function(j, origStruct) {
				
				if(origStruct[key] && origStruct[key].dataset) {
					var ds = origStruct[key].dataset;
					if($.isArray(ds))
						ds = _.object(ds, ds);
					$.extend(val.dataset, ds);
				}
			});
		});
		return $.extend(rest, _.object(withDataset));
	},

	_invalidateAttrs : function(attrs) {
		var union = this._mapping_union(attrs);
		var intersection = this._mapping_intersection(attrs);
		$.each(union, function(key, value) {
			if(intersection[key] == null) {
				value["disabled"] = true;
			} else {
				delete value["disabled"];
			}
		});
		return union;
	},
	
	corpusHasAttr : function(corpus, attr) {
		return attr in $.extend({}, this.struct[corpus].attributes, this.struct[corpus].struct_attributes);
	},
	
	stringifySelected : function() {
		return _.chain(this.selected)
		.pluck("id")
		.invoke("toUpperCase")
		.value().join(",");
	},
	
	getAttrIntersection : function(attr) {
		
		var struct = _.map(this.selected, function(corpus) {
			return _.keys(corpus[attr]);
		});
		return _.intersection.apply(null, struct);
	},
	
	getAttrUnion : function(attr) {
		var struct = _.map(this.selected, function(corpus) {
			return _.keys(corpus[attr]);
		}); 
		return _.union.apply(null, struct);
	},
	
	getContextQueryString : function() {
		return $.grep($.map(_.pluck(settings.corpusListing.selected, "id"), function(id) {
			if("1 paragraph" in settings.corpora[id].context)
				return id.toUpperCase() + ":1 paragraph";
		}), Boolean).join();
	},
	getWithinQueryString : function() {
		return $.grep($.map(_.pluck(settings.corpusListing.selected, "id"), function(id) {
			if("paragraph" in settings.corpora[id].within)
				return id.toUpperCase() + ":paragraph";
		}), Boolean).join();
	}
	
});




var ParallelCorpusListing = new Class({
	Extends : CorpusListing,
	initialize : function(corpora) {
		var self = this;
		this.parallel_corpora = corpora;
		this.corpora = [];
		this.struct = {};
		$.each(corpora, function(__, struct) {
			$.each(struct, function(key, corp) {
				if(key == "default") return;
				self.corpora.push(corp);
				self.struct[corp.id] = corp;
			});
		});
		
	},
	
	select : function(idArray) {
		var self = this;
		this.selected = [];
		$.each(idArray, function(i, id) {
			var corp = self.struct[id];
			self.selected = self.selected.concat(self.getLinked(corp, true));
		});
	},
	
	getCurrentAttributes : function(lang) {
		var corpora = _.filter(this.selected, function(item) {
			return item.lang == lang;
		});
		var struct = _.reduce(corpora, function(a, b) {
			return $.extend({}, a.attributes, b.attributes);
		},{});
		return struct;
	},
	
	getStructAttrs : function(lang) {
		var corpora = _.filter(this.selected, function(item) {
			return item.lang == lang;
		});
		var struct = _.reduce(corpora, function(a, b) {
			return $.extend({}, a.struct_attributes, b.struct_attributes);
		},{});
		$.each(struct, function(key, val) {
			val["isStructAttr"] = true;
		});
		return struct;
	},
	
	
	getLinked : function(corp, andSelf) {
		andSelf = andSelf || false;
		var output = _.filter(this.corpora, function(item) {
			return item.parent == corp.parent && item !== corp;
		});
		if(andSelf)
			output.push(corp);
		return output;
	}

});



settings.corpusListing = new CorpusListing(settings.corpora);

