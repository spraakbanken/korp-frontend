
var settings = {}

settings.corpora = {};

settings.corpora.suc2 = {title: "SUC 2.0",
                         languages: {SUC2: "svenska"},
                         context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
                         attributes: {msd: "ordklass", lemma: "lemma", sentence_n: "mening"}
                        };

settings.corpora.storsuc = {title: "SUC-romaner",
                            languages: {STORSUC: "svenska"},
                            context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
                            attributes: {msd: "ordklass", lemma: "lemma", lex: "lexem", sentence_n: "mening"}
                           };

settings.corpora.saltnld = {title: "SALT-NLD",
                            languages: {SALTNLD_SWE: "svenska", SALTNLD_NLD: "nederländska"},
                             context: {"1 link": "1 länk", "5 words": "5 ord", "10 words": "10 ord"},
                            attributes: {msd: "ordklass", lemma: "lemma", lex: "lexem", link_n: "länk"}
                           };

settings.corpora.minisuc = {title: "Mini-SUC",
                            languages: {MINISUC: "svenska"},
                            context: {"1 sentence": "1 mening", "5 words": "5 ord", "10 words": "10 ord"},
                            attributes: {msd: "ordklass", lemma: "lemma", lex: "lexem", sentence_n: "mening"}
                           };

settings.corpora.minisalt = {title: "Mini-SALT",
                             languages: {MINISALT_SWE: "svenska", MINISALT_NLD: "nederländska"},
                             context: {"1 link": "1 länk", "5 words": "5 ord", "10 words": "10 ord"},
                             attributes: {msd: "ordklass", lemma: "lemma", lex: "lexem", link_n: "länk"}
                            };


settings.cgi_script = "/cgi-bin/glossa/new/cqp.cgi";

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