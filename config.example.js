
/* lemma => grundform, base form
 * lexem =>lemgram, lemgram
 * 
 */

var settings = {}

settings.corpora = {};

settings.corpora.suc2 = {title: "SUC 2.0",
                         languages: {SUC2: "svenska"},
                         context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
                         attributes: {msd: "ordklass", lemma: language.base_form, sentence_n: language.sentence, sentence: language.sentence}
                        };



settings.corpora.storsuc = {title: "SUC-romaner",
                            languages: {STORSUC: "svenska"},
                            context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
                            attributes: {msd: "ordklass", lemma: language.base_form, lex: language.lemgram, sentence_n: language.sentence}
                           };

settings.corpora.saltnld = {title: "SALT-NLD",
                            languages: {SALTNLD_SWE: "svenska", SALTNLD_NLD: "nederländska"},
                             context: {"1 link": "1 länk", "5 words": "5 ord", "10 words": "10 ord"},
                            attributes: {msd: "ordklass", lemma: language.base_form, lex: language.lemgram, link_n: language.link}
                           };

settings.corpora.konkplus = {title: "Konkplus: svenska tidningstexter",
						        languages: {KONKPLUS: "svenska"},
						        context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
						        attributes: {msd: "ordklass", lemma: "lemma", lex: "lexem",
						                     genre: "genre", corpus: "delkorpus", sentence_n: "mening"}
						       };

settings.cgi_script = "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi";

settings.arg_types = {
	    "word": String,
	    "notword": String,
	    "beginswith": String,
	    "endswith": String,
	    "regexp": RegExp,
	    "pos": {"AB":"adverb", 
				"DL":"determinerare",
			    "DL": "interpunktion",
			    "DT": "determinerare",
			    "HA": "frågande/relativt adverb",
			    "HD": "frågande/relativ determinerare",
			    "HP": "frågande/relativt pronomen",
			    "HS": "frågande/relativt possesivt pronomen",
			    "IE": "infinitivmärke",
			    "IN": "interjektion",
			    "JJ": "adjektiv",
			    "KN": "konjunktion",
			    "NN": "substantiv",
			    "PC": "particip",
			    "PL": "partikel",
			    "PM": "egennamn",
			    "PN": "pronomen",
			    "PP": "preposition",
			    "PS": "possessivt pronomen",
			    "RG": "grundtal",
			    "RO": "ordningstal",
			    "SN": "subjunktion",
			    "UO": "utländskt ord",
			    "VB": "verb"},
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