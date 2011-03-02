
/* lemma => grundform, base form
 * lexem =>lemgram, lemgram
 * 
 */

var settings = {}

settings.corpora = {};

//added for search in all corpora
settings.corpora.all = {title: "-Alla korpusar-",
        languages: {all: "svenska"},
        context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
        attributes: {}
       };

settings.corpora.vivill = {title: "Svenska partiprogram och valmanifest 1887-2010",
        languages: {VIVILL: "svenska"},
        context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
        attributes: {pos: language.pos, msd: language.msd, lemma: language.base_form, lex: language.lemgram, saldo: language.saldo,
                     dephead: language.dephead, deprel: language.deprel, ref: "ref",
                     sentence: language.sentence},
        struct_attributes: {text_year:language.year,text_party:language.party}
       };

settings.corpora.suc2 = {title: "SUC 2.0",
        languages: {SUC2: "svenska"},
        context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
        attributes: {pos: language.pos, msd: language.msd, lemma: language.base_form, lex: language.lemgram, saldo: language.saldo,
                     dephead: language.dephead, deprel: language.deprel, wid: "ord",
                     sentence: language.sentence, paragraph: language.paragraph, text: language.text}
       };

settings.corpora.storsuc = {title: "SUC-romaner",
           languages: {STORSUC: "svenska"},
           context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
           attributes: {pos: language.pos, msd: language.msd, lemma: language.base_form, lex: language.lemgram, saldo: language.saldo,
                        dephead: language.dephead, deprel: language.deprel, wid: "ord",
                        sentence: language.sentence, paragraph: language.paragraph, text: language.text}
          };
/*
settings.corpora.saltnld = {title: "SALT-NLD",
           languages: {SALTNLD_SWE: "svenska", SALTNLD_NLD: "nederländska"},
            context: {"1 link": "1 länk", "5 words": "5 ord", "10 words": "10 ord"},
           attributes: {pos: language.pos, msd: language.msd, lemma: language.base_form, lex: language.lemgram, saldo: language.saldo,
                        link: language.link, text: language.text}
          };
*/
settings.corpora.konkplus = {title: "Konkplus: svenska tidningstexter",
		        languages: {KONKPLUS: "svenska"},
		        context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
		        attributes: {pos: language.pos, msd: language.msd, lemma: language.base_form, lex: language.lemgram, saldo: language.saldo,
		                     genre: "genre", textid: "delkorpus", sentence: language.sentence}
		       };

settings.corpora.parole = {title: "PAROLE",
		        languages: {PAROLE: "svenska"},
		        context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
		        attributes: {pos: language.pos, msd: language.msd, lemma: language.base_form, lex: language.lemgram, saldo: language.saldo,
		                     sentence: language.sentence}
		       };

settings.corpora.lt = {title: "Läkartidningen (1996)",
		        languages: {LT: "svenska"},
		        context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
		        attributes: {pos: language.pos, msd: language.msd, lemma: language.base_form, lex: language.lemgram, entity: "entitet",
		        			 dephead: language.dephead, deprel: language.deprel, wid: "ord",
		                     sentence: language.sentence, article: "artikel"}
		       };

settings.corpora.snp7879 = {title: "SNP 78-79 (Riksdagens snabbprotokoll)",
		        languages: {SNP7879: "svenska"},
		        context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
		        attributes: {pos: language.pos, msd: language.msd, lemma: language.base_form, lex: language.lemgram, saldo: language.saldo,
		        			 dephead: language.dephead, deprel: language.deprel, wid: "ord",
		                     sentence: language.sentence, text: language.text}
		       };




settings.cgi_script = "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi";

settings.arg_types = {
	    "word": String,
	    "notword": String,
	    "beginswith": String,
	    "endswith": String,
	    "regexp": RegExp,
	    "pos": ["AB", 
				"DL",
			    "DL",
			    "DT",
			    "HA",
			    "HD",
			    "HP",
			    "HS",
			    "IE",
			    "IN",
			    "JJ",
			    "KN",
			    "NN",
			    "PC",
			    "PL",
			    "PM",
			    "PN",
			    "PP",
			    "PS",
			    "RG",
			    "RO",
			    "SN",
			    "UO",
			    "VB"],
	    "msd": String,
	    "max": Number,
	    "min": Number,
	}


settings.arg_groups = {
    "ord": {
        word: "ordet är",
        notword: "ordet är inte",
        beginswith: "börjar med",
        endswith: "slutar med",
        regexp: "reguljärt uttryck"},
    "ordklass": {
        pos: "ordklassen är",
        msd: "ordklassen börjar med"},
    "intervall": {
        max: "upp till",
        min: "minst"}
};

settings.inner_args = {
    word: function(s){return 'word = "' + regescape(s) + '"'},
    notword: function(s){return 'word != "' + regescape(s) + '"'},
    beginswith: function(s){return 'word = "' + regescape(s) + '.*"'},
    endswith: function(s){return 'word = ".*' + regescape(s) + '"'},
    regexp: function(s){return 'word = "' + s + '"'},
    pos: function(s){return 'pos = "' + regescape(s) + '"'},
    msd: function(s){return 'msd = "' + regescape(s) + '.*"'}
};

settings.outer_args = {
    min: function(query, values) {query.min = Math.min(values)},
    max: function(query, values) {query.max = Math.max(values)}
};

settings.operators = {
    include: "eller", 
    intersect: "och", 
    exclude: "men inte"
};

settings.first_operators = {
    find: "Leta efter"
};

var token_skip_space_before = ['.', ',', '!', '?', '%', ';', '-','"','\'',')',']','}'];
var token_skip_space_after  = ['(','[','{'];