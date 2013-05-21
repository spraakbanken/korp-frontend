/* lemma => grundform, base form
 * lexem => lemgram, lemgram
 *
 */
var settings = {};

var isLab = window.isLab || false;

settings.lemgramSelect = true;
settings.autocomplete = true;


settings.modeConfig = [
    {
        localekey: "modern_texts",
        mode: "default"
    },
    {
        localekey: "parallel_texts",
        mode: "parallel"
    },
    {
        localekey: "old_swedish_texts",
        mode: "old_swedish"
    },
    {
        localekey: "lb_texts",
        mode: "lb"
    },
    {
        localekey: "fisk1800_texts",
        mode: "fisk1800"
    },
    {
        localekey: "faroese_texts",
        mode: "faroe"
    },
    {
        localekey: "siberian_texts",
        mode: "siberian_german",
        labOnly : true
    },
    {
        localekey: "1800_texts",
        mode: "1800",
        labOnly : true
    },
    {
        localekey: "lawroom",
        mode: "law",
        labOnly : true
    },
    {
        localekey: "digidaily",
        mode: "digidaily",
        labOnly : true
    }
];




var karpLemgramLink = "http://spraakbanken.gu.se/karp/#search=cql%7C(lemgram+%3D+%22<%= val.replace(/:\\d+/, '') %>%22)+sortBy+lemgram";

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

	if(type == "word" && !value) return function() {return "";};

	if(type == "date_interval") {
		c.log("date_interval", arguments)
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

// settings.liteOptions = $.exclude(settings.defaultOptions, ["starts_with", "contains", "ends_with", "matches"]);
settings.liteOptions = _.omit.apply(null, [settings.defaultOptions, "starts_with", "contains", "ends_with", "matches"]);


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
	stringify : function(baseform) {
		return baseform.replace(/:\d+$/,'').replace(/_/g,' ');
	},
	opts : settings.liteOptions
};
attrs.lemgram = {
	label : "lemgram",
	type : "set",
	displayType : "autocomplete",
	opts : settings.liteOptions,
	stringify : function(lemgram) {
		return util.lemgramToString(lemgram, true);
	},
	externalSearch : karpLemgramLink,
	internalSearch : true
};
attrs.saldo = {
	label : "saldo",
	type : "set",
	displayType : "autocomplete",
	opts : settings.liteOptions,
	stringify : function(saldo) {
		return util.saldoToString(saldo, true);
	},
	externalSearch : "http://spraakbanken.gu.se/karp/#search-tab-1&search=cql|(saldo+%3D+<%= val %>)",
	internalSearch : true
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
	opts : settings.liteOptions,
	stringify : function(lemgram) {
		return util.lemgramToString(lemgram, true);
	},
	externalSearch : karpLemgramLink,
	internalSearch : true
};
attrs.suffix = {
	label : "suffix",
	type : "set",
	displayType : "autocomplete",
	opts : settings.liteOptions,
	stringify : function(lemgram) {
		return util.lemgramToString(lemgram, true);
	},
	externalSearch : karpLemgramLink,
	internalSearch : true
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
	contents : ["sweachum", "sweacsam"]
};

settings.corporafolders.strindberg = {
		title : "August Strindberg",
		contents : ["strindbergromaner", "strindbergbrev"]
};

settings.corporafolders.bloggmix = {
	title : "Bloggmix",
	contents : ["bloggmix1998", "bloggmix1999", "bloggmix2000", "bloggmix2001", "bloggmix2002", "bloggmix2003", "bloggmix2004", "bloggmix2005", "bloggmix2006", "bloggmix2007", "bloggmix2008", "bloggmix2009", "bloggmix2010", "bloggmix2011", "bloggmix2012", "bloggmix2013", "bloggmixodat"],
	description : "Material från ett urval av svenska bloggar. Uppdateras regelbundet."
};

settings.corporafolders.fisk = {
	title : "Finlandssvenska texter",
	contents : ["barnlitteratur", "fsbessaistik", "fsbsakprosa"],
	description : "Det första steget för att skapa en finlandssvensk korpus togs redan " +
			"på 1990-talet (Institutionen för nordiska språk vid Helsingfors universitet) " +
			"och under åren 1999–2000 fortsatte arbetet (ett samarbetsprojekt mellan " +
			"Institutet för de inhemska språken, Institutionen för allmän språkvetenskap " +
			"och CSC (IT Center for Science)). Under åren 2011–2013 byggs den finlandssvenska " +
			"korpusen ut som ett samarbetsprojekt mellan Svenska litteratursällskapet i Finland, " +
			"Institutet för de inhemska språken och Göteborgs universitet."
};

settings.corporafolders.fisk.webtexts = {
	title : "Webbtexter",
	contents : ["fsbbloggvuxna", "magmakolumner"]
};

settings.corporafolders.fisk.governmental = {
	title : "Myndighetstexter",
	contents : ["lagtexter", "myndighet", "myndighet2"]
};

settings.corporafolders.fisk.novels = {
	title : "Skönlitteratur",
	contents : ["fsbskonlit1960-1999", "fsbskonlit2000tal"]
};

settings.corporafolders.fisk.newspapertexts = {
	title : "Tidningstexter",
	contents : ["borgabladet", "vastranyland", "at2012", "ostranyland"]
};

settings.corporafolders.fisk.newspapertexts.fnb = {
	title : "FNB",
	contents : ["fnb1999", "fnb2000"],
	description : "<a href=\"http://www.stt.fi/sv\" target=\"_blank\">FNB</a> är Finlands ledande nyhets- och bildbyrå."
};

settings.corporafolders.fisk.newspapertexts.hbl = {
	title : "Hufvudstadsbladet",
	contents : ["hbl1991", "hbl1998", "hbl1999", "hbl20122013"],
	description : "<a href=\"http://www.hbl.fi\" target=\"_blank\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland."
};

settings.corporafolders.fisk.newspapertexts.jakobstadstidning = {
	title : "Jakobstads tidning",
	contents : ["jakobstadstidning1999", "jakobstadstidning2000"],
	description : "Jakobstads Tidning var en lokal dagstidning i Österbotten som gavs ut under perioden 1898–2008."
};

settings.corporafolders.fisk.newspapertexts.pargaskungorelser = {
	title : "Pargas kungörelser",
	contents : ["pargaskungorelser2011", "pargaskungorelser2012"],
	description : "<a href=\"http://www.pku.fi\" target=\"_blank\">Pargas Kungörelser</a> är en regional svenskspråkig tidning i Pargas med omnejd."
};

settings.corporafolders.fisk.newspapertexts.sydosterbotten = {
	title : "Syd-Österbotten",
	contents : ["sydosterbotten2010", "sydosterbotten2011", "sydosterbotten2012", "sydosterbotten2013"],
	description : "<a href=\"http://www.sydin.fi\" target=\"_blank\">Syd-Österbotten</a> är en regional svenskspråkig dagstidning i Österbotten."
};

settings.corporafolders.fisk.newspapertexts.vasab = {
	title : "Vasabladet",
	contents : ["vasabladet1991", "vasabladet2012", "vasabladet2013"],
	description : "<a href=\"http://www.vasabladet.fi\" target=\"_blank\">Vasabladet</a> är en regional svenskspråkig dagstidning i Österbotten."
};

settings.corporafolders.fisk.newspapertexts.abounderrattelser = {
	title : "Åbo Underrättelser",
	contents : ["abounderrattelser2012", "abounderrattelser2013"],
	description : "<a href=\"www.abounderrattelser.fi\" target=\"_blank\">Åbo Underrättelser</a> är en regional svenskspråkig dagstidning i Åbotrakten."
};

settings.corporafolders.fisk.newspapertexts.osterbottenstidning = {
	title : "Österbottens Tidning",
	contents : ["osterbottenstidning2011", "osterbottenstidning2012", "osterbottenstidning2013"],
	description : "<a href=\"http://www.ot.fi\" target=\"_blank\">Österbottens Tidning</a> är en regional svenskspråkig tidning i Österbotten."
	// 
};

settings.corporafolders.fisk.magazines = {
	title : "Tidskrifter",
	contents : ["astranova", "bullen", "fanbararen", "finsktidskrift", "forumfeot", "hankeiten", "hanken", "kallan", "meddelanden", "nyaargus", "studentbladet", "svenskbygden"]
};

settings.corporafolders.fisk.youthnovels = {
	title : "Ungdomslitteratur",
	contents : ["ungdomslitteratur"]
};

settings.corporafolders.protected = {
	title : "Skyddade korpusar",
	contents : ["ansokningar", "cefr", "gdc", "soexempel", "tisus"]
};

settings.corporafolders.medical = {
	title : "Medicinska texter",
	contents : ["diabetolog", "smittskydd"]
};

settings.corporafolders.medical.ltd = {
	title : "Läkartidningen",
	contents : ["lt1996", "lt1997", "lt1998", "lt1999", "lt2000", "lt2001", "lt2002", "lt2003", "lt2004", "lt2005"]
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
	contents : ["gp1994", "gp2001", "gp2002", "gp2003", "gp2004", "gp2005", "gp2006", "gp2007", "gp2008", "gp2009", "gp2010", "gp2011", "gp2012", "gp2d"]
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
	title : "Bloggtexter",
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

settings.corpora["fsbskonlit1960-1999"] = {
	id : "fsbskonlit1960-1999",
	title : "Skönlitteratur 1960–1999",
	description : "Material ur skönlitterära verk publicerade under 1960–1999.",
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

settings.corpora.fsbskonlit2000tal = {
	id : "fsbskonlit2000tal",
	title : "Skönlitteratur 2000–2013",
	description : "Material ur skönlitterära verk publicerade under 2000–2013.",
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

settings.corpora.barnlitteratur = {
	id : "barnlitteratur",
	title : "Barnlitteratur 2000–2013",
	description : "Material ur barnlitterära verk publicerade under 2000–2013.",
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
	title : "Essäistisk litteratur 1992–2013",
	description : "Material ur essäistiska verk publicerade under 1992–2013",
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
	title : "Sakprosa 2006–2013",
	description : "Material ur facklitterära verk publicerade under 2006–2013.",
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

settings.corpora.ungdomslitteratur = {
	id : "ungdomslitteratur",
	title : "Ungdomslitteratur",
	description : "",
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

settings.corpora.forumfeot = {
	id : "forumfeot",
	title : "Forum för ekonomi och teknik 2007–2012",
	description : "<a href=\"http://www.forummag.fi\">Forum för ekonomi och teknik</a> är Finlands enda svenskspråkiga affärsmagasin och ger sina läsare information om näringsliv, ledarskap och teknologi.",
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
	description : "",
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
	description : "",
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
		text_type : {label : "type",
			displayType : "select",
			dataset : {
				"Licentiat" : "Licentiat",
				"PhD" : "PhD"
			}
		},
		text_subject : {label : "subject",
			displayType : "select",
			dataset : {
				"Etnologi" : "Etnologi",
				"Filosofi" : "Filosofi",
				"Historia" : "Historia",
				"Jämförande språkvetenskap och lingvistik" : "Jämförande språkvetenskap och lingvistik",
				"Konst" : "Konst",
				"Litteraturvetenskap" : "Litteraturvetenskap",
				"Religionsvetenskap" : "Religionsvetenskap"
			}
		}
	}
};

settings.corpora.sweacsam = {
	id : "sweacsam",
	title : "Samhällsvetenskap",
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
		text_type : {label : "type",
			displayType : "select",
			dataset : {
				"Licentiat" : "Licentiat",
				"PhD" : "PhD"
			}
		},
		text_subject : {label : "subject",
			displayType : "select",
			dataset : {
				"Ekonomi och näringsliv" : "Ekonomi och näringsliv",
				"Juridik" : "Juridik",
				"Medie- och kommunikationsvetenskap" : "Medie- och kommunikationsvetenskap",
				"Psykologi" : "Psykologi",
				"Social och ekonomisk geografi" : "Social och ekonomisk geografi",
				"Sociologi" : "Sociologi",
				"Statsvetenskap" : "Statsvetenskap",
				"Utbildningsvetenskap" : "Utbildningsvetenskap"
			}
		}
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

settings.corpora.gp2012 = {
	id : "gp2012",
	title : "GP 2012",
	description : "Göteborgs-Posten 2012.",
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

var bloggmix_structs = {
	blog_title : {label : "blog_title"},
	blog_url : {label : "blog_url", type : "url"},
	blog_age : {label : "author_age"},
	blog_city : {label : "city"},
	blog_categories : {label : "categories", type : "set"},
	text_title : {label : "post_title"},
	text_date : {label : "date"},
	text_tags : {label : "tags", type : "set"},
	text_url : {label : "post_url", type : "url"}
}

settings.corpora.bloggmix1998 = {
	id : "bloggmix1998",
	title : "Bloggmix 1998",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix1999 = {
	id : "bloggmix1999",
	title : "Bloggmix 1999",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2000 = {
	id : "bloggmix2000",
	title : "Bloggmix 2000",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2001 = {
	id : "bloggmix2001",
	title : "Bloggmix 2001",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2002 = {
	id : "bloggmix2002",
	title : "Bloggmix 2002",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2003 = {
	id : "bloggmix2003",
	title : "Bloggmix 2003",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2004 = {
	id : "bloggmix2004",
	title : "Bloggmix 2004",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2005 = {
	id : "bloggmix2005",
	title : "Bloggmix 2005",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2006 = {
	id : "bloggmix2006",
	title : "Bloggmix 2006",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2007 = {
	id : "bloggmix2007",
	title : "Bloggmix 2007",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2008 = {
	id : "bloggmix2008",
	title : "Bloggmix 2008",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2009 = {
	id : "bloggmix2009",
	title : "Bloggmix 2009",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2009 = {
	id : "bloggmix2009",
	title : "Bloggmix 2009",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2010 = {
	id : "bloggmix2010",
	title : "Bloggmix 2010",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2011 = {
	id : "bloggmix2011",
	title : "Bloggmix 2011",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2012 = {
	id : "bloggmix2012",
	title : "Bloggmix 2012",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmix2013 = {
	id : "bloggmix2013",
	title : "Bloggmix 2013",
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
	struct_attributes : bloggmix_structs
};

settings.corpora.bloggmixodat = {
	id : "bloggmixodat",
	title : "Bloggmix okänt datum",
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
	struct_attributes : bloggmix_structs
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

settings.corpora.suc3 = {
	id : "suc3",
	title : "SUC 3.0",
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
	title: "SALT svenska-nederländska",
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

settings.corpora["europarl-sv"] = {
	id : "europarl-sv",
	title: "Europarl svenska",
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
		text_date : {label : "date"},
		text_speaker : {label : "speaker"}
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
		text_title : {label : "title"},
		text_date : {label : "year"}
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
	title : "Svenska Wikipedia (januari 2013)",
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

settings.corpora.bullen = {
	id : "bullen",
	title : "Bullen 2010–2012",
	description : "<a href=\"http://www.karen.abo.fi/index.php?u[2]=0&u[3]=70\">Bullen</a> är Åbo Akademis Studentkårs informationsbulletin.",
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

settings.corpora.fanbararen = {
	id : "fanbararen",
	title : "Fanbäraren 2011–2012",
	description : "<a href=\"http://www.nylandsbrigadsgille.fi/sidor/?page_id=813\">Fanbäraren</a> är en tidskrift som utges gemensamt av Nylands brigad och Nylands Brigads Gille, med syfte att öka kännedomen om utbildningen vid Nylands Brigad och öka sammanhållningen mellan Gillets medlemmar.",
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

settings.corpora.hankeiten = {
	id : "hankeiten",
	title : "Hankeiten 2006–2012",
	description : "<a href=\"http://www.shsweb.fi/shs/arkiv/hankeiten1\">Hankeiten</a> är Svenska Handelshögskolans Studentkårs tidskrift.",
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

settings.corpora.borgabladet = {
	id : "borgabladet",
	title : "Borgåbladet 2012–2013",
	description : "<a href=\"http://www.bbl.fi\">Borgåbladet</a> är en regional svenskspråkig dagstidning i Borgå med omnejd.",
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

settings.corpora.sydosterbotten2010 = {
	id : "sydosterbotten2010",
	title : "Syd-Österbotten 2010",
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
	    text_date : {label : "date"}
	}
};

settings.corpora.sydosterbotten2011 = {
	id : "sydosterbotten2011",
	title : "Syd-Österbotten 2011",
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
	    text_date : {label : "date"}
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
	    text_date : {label : "date"}
	}
};

settings.corpora.sydosterbotten2013 = {
	id : "sydosterbotten2013",
	title : "Syd-Österbotten 2013",
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
	    text_date : {label : "date"}
	}
};

settings.corpora.vastranyland = {
	id : "vastranyland",
	title : "Västra Nyland 2012–2013",
	description : "<a href=\"http://www.vastranyland.fi\">Västra Nyland</a> är en regional svenskspråkig dagstidning i Västra Nyland.",
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

settings.corpora.ostranyland = {
	id : "ostranyland",
	title : "Östra Nyland 2012–2013",
	description : "<a href=\"http://www.ostnyland.fi\">Östra Nyland</a> är en regional svenskspråkig dagstidning i Östra Nyland.",
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

settings.corpora.abounderrattelser2012 = {
	id : "abounderrattelser2012",
	title : "Åbo Underrättelser 2012",
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
		text_date : {label : "date"}
	}
};

settings.corpora.abounderrattelser2013 = {
	id : "abounderrattelser2013",
	title : "Åbo Underrättelser 2013",
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
		text_date : {label : "date"},
		text_type : {label : "section"}
	}
};

settings.corpora.vasabladet2012 = {
	id : "vasabladet2012",
	title : "Vasabladet 2012",
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

settings.corpora.vasabladet2013 = {
	id : "vasabladet2013",
	title : "Vasabladet 2013",
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
	    text_date : {label : "date"}
	}
};

settings.corpora.osterbottenstidning2011 = {
	id : "osterbottenstidning2011",
	title : "Österbottens Tidning 2011",
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
	    text_date : {label : "date"}
	}
};

settings.corpora.osterbottenstidning2012 = {
	id : "osterbottenstidning2012",
	title : "Österbottens Tidning 2012",
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
	    text_date : {label : "date"}
	}
};

settings.corpora.osterbottenstidning2013 = {
	id : "osterbottenstidning2013",
	title : "Österbottens Tidning 2013",
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
	    text_date : {label : "date"}
	}
};

settings.corpora.fnb1999 = {
	id : "fnb1999",
	title : "FNB 1999",
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
		text_date : {label : "date"},
		text_title : {label : "title"}
	}
};

settings.corpora.fnb2000 = {
	id : "fnb2000",
	title : "FNB 2000",
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
		text_date : {label : "date"},
		text_title : {label : "title"}
	}
};

settings.corpora.hbl1991 = {
	id : "hbl1991",
	title : "Hufvudstadsbladet 1991",
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
		text_type : {label : "section"}
	}
};

settings.corpora.hbl1998 = {
	id : "hbl1998",
	title : "Hufvudstadsbladet 1998",
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
		text_year : {label : "year"}
	}
};

settings.corpora.hbl1999 = {
	id : "hbl1999",
	title : "Hufvudstadsbladet 1999",
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
		text_year : {label : "year"}
	}
};

settings.corpora.hbl20122013 = {
	id : "hbl20122013",
	title : "Hufvudstadsbladet (2012–)2013",
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
		text_date : {label : "date"}
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

settings.corpora.tisus = {
	id : "tisus",
	title : "TISUS-texter",
	description : "",
	limited_access : true,
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
		text_id : {label : "id"},
		text_age : {label : "age"},
		text_gender : {label : "gender"},
		text_residencetime : {label : "residencetime"},
		text_education : {label : "education"},
		text_l1 : {label : "tisus_l1", type : "set"},
		text_lf1 : {label : "tisus_lf1"},
		text_lf2 : {label : "tisus_lf2"},
		text_sum : {label : "sum"},
		text_written : {label : "tisus_written"},
		text_oral : {label : "tisus_oral"},
		text_finalgrade : {label : "finalgrade"},
		text_proficiencylevel : {label : "proficiencylevel"},
		text_date : {label : "date"}
	}
};

settings.corpora.ansokningar = {
	id : "ansokningar",
	title : "Ansökningar",
	description : "",
	limited_access : true,
	context : settings.defaultContext,
	within : settings.defaultWithin,
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
		text_id : {label : "id"},
		text_gender : {label : "gender"},
		text_birthyear : {label : "birthyear"}
	}
};

settings.corpora.cefr = {
	id : "cefr",
	title : "CEFR",
	description : "",
	limited_access : true,
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
		text_title : {label : "title"},
		text_date : {label : "date"}
	}
};

settings.corpora.twitter = {
	id : "twitter",
	title : "Twittermix",
	description : "Material från ett urval av svenska Twitteranvändare. Uppdateras regelbundet.",
	within : {
		"sentence" : "sentence",
		"text" : "text"
	},
	context : {
		"1 sentence" : "1 sentence",
		"1 text" : "1 text"
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
		user_username : {label : "username2"},
		user_name : {label : "name"},
		text_datetime : {label : "date"},
		text_weekday : {label : "weekday"},
		text_hashtags : {label : "hashtags", type : "set"},
		text_mentions : {label : "mentions", type : "set"},
		text_retweets : {label : "retweets"},
		text_location : {label : "location"},
		text_coordinates : {label : "coordinates"},
		text_replytouser : {label : "replytouser"},
		user_location : {label : "user_location"},
		user_followers : {label : "followers"},
		user_following : {label : "following"},
		user_tweets : {label : "tweets"},
		user_description : {
					label : "description",
					pattern : '<p style="margin-left: 5px;"><%=val%></p>'
			},
		user_url : {label : "website", type : "url"},
		user_created : {label : "user_since"},
		user_trstrank : {label : "trstrank"},
	}
};

settings.corpora.gdc = {
	id : "gdc",
	title : "Gothenburg Dialogue Corpus (GDC)",
	description : 'För åtkomst kontakta <a href="mailto:cajsa.ottesjo@gu.se">Cajsa Ottesjö</a>.',
	limited_access : true,
	within : settings.defaultWithin,
	context : {
	"1 sentence" : "1 sentence",
	"3 sentence" : "3 sentences"
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
		"text_activity1" : {label : "activity1"},
		"text_activity2" : {label : "activity2"},
		"text_activity3" : {label : "activity3"},
		"text_title" : {label : "title"},
		"text_duration" : {label : "duration"},
		"text_project" : {label : "project"},
		"line_speaker" : {label : "speaker"},
		"text_date" : {label : "date"},
		"section_name" : {label : "section"}
		// TODO: this gives some error, fix this.
		//"meta_comment" : {label : "comment", type : "set"}
	}
};

settings.corpora.soexempel = {
	id : "soexempel",
	title : "Språkprov SO 2009",
	description : 'De drygt 94 000 språkexemplen är hämtade ur Svensk ordbok utgiven av Svenska Akademien (2009). '+
				  'Exemplens uppgift är att stödja ordboksdefinitionerna och att ge information om uppslagsordens fraseologi. ' +
				  '<br><br>För åtkomst kontakta <a href="mailto:emma.skoldberg@svenska.gu.se">Emma Sköldberg</a>.',
	limited_access : true,
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
		"text_date" : {label : "year"},
		"entry_word" : {label : "entryword"},
		"entry_entryno" : {label : "entryno"},
		"entry_sense1" : {label : "sense1"},
		"entry_sense2" : {label : "sense2"}
	}
};


/*
 * MISC
 */

settings.cgi_script = "http://spraakbanken.gu.se/ws/korp";
//settings.cgi_script = "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp2.cgi";

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
					"data-corpora" : JSON.stringify(corpora)
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
					[query, JSON.stringify(corpora), value, util.getLocaleString("pos_" + value)]);
			return appendDiagram(output, corpora, value);
		};
	case "prefix":
	case "suffix":
	case "lex":
		return function(row, cell, value, columnDef, dataContext) {
		var corpora = getCorpora(dataContext);
		if(value == "&Sigma;") return appendDiagram(value, corpora, value);
		else if(value == "|") return "-";
		output = _(value.split("|"))
				.filter(Boolean)
				.map(function(item) {
					var wrapper = $("<div>");
					$("<span>").html(util.lemgramToString(item, true)).attr("data-cqp", '[lex contains "' + item + '"]').appendTo(wrapper);
					return wrapper.html();
				})
				.join(", ");
		return appendDiagram(output, corpora, value);
		};
	case "saldo":
		return function(row, cell, value, columnDef, dataContext) {
		var corpora = getCorpora(dataContext);
		if(value == "&Sigma;") return appendDiagram(value, corpora, value);
		else if(value == "|") return "-";
		output = _(value.split("|"))
				.filter(Boolean)
				.map(function(item) {
					return util.saldoToString(item, true);
				})
				.join(", ");
		return appendDiagram(output, corpora, value);
		};
	case "deprel":
		return function(row, cell, value, columnDef, dataContext) {
			var corpora = getCorpora(dataContext);
			if(value == "&Sigma;") return appendDiagram(value, corpora, value);
			var query = $.map(dataContext.hit_value.split(" "), function(item) {
				return $.format('[deprel="%s"]', item);
			}).join(" ");
			output = $.format("<span class='link' data-query='%s' data-corpora='%s' rel='localize[%s]'>%s</span> ",
					[query, JSON.stringify(corpora),"deprel_" + value, util.getLocaleString("deprel_" + value)]);
			return appendDiagram(output, corpora, value);

		};
	default:
		return function(row, cell, value, columnDef, dataContext) {
			var corpora = getCorpora(dataContext);
			var query = $.map(dataContext.hit_value.split(" "), function(item) {
				return $.format('[%s="%s"]', [value, item]);
			}).join(" ");
			output = $.format("<span data-query='%s' data-corpora='%s' rel='localize[%s]'>%s</span> ",
					[query, $.toJSON(corpora),"deprel_" + value, util.getLocaleString(value)]);
			if(value == "&Sigma;") return appendDiagram(output, corpora, value);

			return appendDiagram(output, corpora, value);
		};
	}

	return output;
};


delete attrs;
delete sattrs;
delete context;
delete ref;




settings.posset = {
   type : "set",
   label : "pos",
   displayType : "select",
   translationKey : "pos_",
   dataset :  {
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
			}
};
settings.fsvlemma = {
	//pattern : "<a href='http://spraakbanken.gu.se/karp/#search=cql%7C(gf+%3D+%22<%= key %>%22)+sortBy+wf'><%= val %></a>",
  	type : "set",
  	label : "baseform",
  	displayType : "autocomplete",
  	stringify : function(baseform) {
		return baseform.replace(/:\d+$/,'').replace(/_/g,' ');
	}
//  	externalSearch : "http://spraakbanken.gu.se/karp/#search=cql%7C(gf+%3D+%22<%= val %>%22)+sortBy+lemgram",
//	internalSearch : true

};
settings.fsvlex = {
  	type : "set",
  	label : "lemgram",
  	displayType : "autocomplete",
  	stringify : function(str) {
  		return util.lemgramToString(str, true);
  	},
  	externalSearch : karpLemgramLink,
	internalSearch : true
};
settings.fsvvariants = {
  	type : "set",
  	label : "variants",
  	stringify : function(str) {
  		return util.lemgramToString(str, true);
  	},
  	displayType : "autocomplete",
  	opts : settings.liteOptions,
  	externalSearch : karpLemgramLink,
	internalSearch : true
};

settings.fsvdescription ='<a href="http://project2.sol.lu.se/fornsvenska/">Fornsvenska textbanken</a> är ett projekt som digitaliserar fornsvenska texter och gör dem tillgängliga över webben. Projektet leds av Lars-Olof Delsing vid Lunds universitet.';
var fsv_yngrelagar = {
	morf : 'fsvm',
	id : "fsv-yngrelagar",
	title : "Yngre lagar – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
		posset : settings.posset,
		lemma : settings.fsvlemma,
		lex : settings.fsvlex,
		variants : settings.fsvvariants
		},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Kristoffers Landslag, nyskrivna flockar i förhållande till MEL",
				"Kristoffers Landslag, innehållsligt ändrade flockar i förhållande til MEL",
				"Kristoffers Landslag, flockar direkt hämtade från MEL",
				"Kristoffers Landslag"
				],
		},
		text_date : {label : "date"}
	}
};

var fsv_aldrelagar = {
	morf : 'fsvm',
	id : "fsv-aldrelagar",
	title : "Äldre lagar – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
		posset : settings.posset,
		lemma : settings.fsvlemma,
		lex : settings.fsvlex,
		variants : settings.fsvvariants
				},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Yngre Västgötalagens äldsta fragment, Lydekini excerpter och anteckningar",
				"Tillägg till Upplandslagen, hskr A (Ups B 12)",
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
				"Skånelagen, enligt Holm B 76",
				"Östgötalagen, fragment D, ur Holm B 24",
				"Östgötalagen A, ur Holm B 50",
				"Äldre Västgötalagen",
				"Östgötalagen, fragment M, ur Holm B 196",
				"Gutalagen enligt Holm B 64",
				"Upplandslagen enligt Codex Holm B 199, Schlyters hskr B",
				"Smålandslagens kyrkobalk",
				"Dalalagen (Äldre Västmannalagen)",
				"Gutalagens additamenta enligt AM 54",
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




