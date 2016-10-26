/* lemma => grundform, base form
 * lexem => lemgram, lemgram
 *
 */
var settings = {};

var isLab = window.isLab || false;

settings.autocomplete = true;
settings.enableMap = !isLab;
settings.newMapEnabled = isLab;
settings.hits_per_page_default = 25

settings.languages = ["sv", "en"];
settings.defaultLanguage = "sv";

settings.downloadFormats = [
    "csv",
    "tsv",
    "annot",
    "ref",
];

settings.downloadFormatParams = {
    "*": {
        structs: "+"
    },
    "ref": {
        format: "bibref,xls"
    },
    "csvp": {
        format: "tokens,csv",
        attrs: "+,-lex",
        match_marker: "***"
    },
    "csv": {
        format: "sentences,csv"
    },
    "annot": {
        format: "tokens,xls",
        attrs: "+,-lex",
        match_marker: "***"
    },
    "nooj": {
        attrs: "+"
    },
    "tsv": {
        format: "sentences,tsv"
    },
    "vrt": {
        attrs: "+"
    },
};

// for extended search dropdown, can be 'union' or 'intersection'
settings.word_attribute_selector = "union"
settings.struct_attribute_selector = "union"

// for 'compile statistics by' selector, can be 'union' or 'intersection'
settings.reduce_word_attribute_selector = "intersection"
settings.reduce_struct_attribute_selector = "intersection"

settings.news_desk_url = "https://svn.spraakdata.gu.se/sb-arkiv/pub/component_news/json/korpnews.json";

settings.wordpictureTagset = {
    // supported pos-tags
    verb: "vb",

    noun: "nn",
    adjective: "jj",
    adverb: "ab",
    preposition: "pp",

    // dependency releations
    subject: "ss",
    object: "obj",
    adverbial: "adv",
    preposition_rel: "pa",
    pre_modifier: "at",
    post_modifier: "et"

}


settings.wordPictureConf = {
    verb: [[
        {rel: "subject", css_class: "color_blue"},
        "_",
        {rel: "object", css_class: "color_purple"},
        {rel: "adverbial", css_class: "color_green"}
    ]],
    noun: [
        [{rel: "preposition_rel", css_class: "color_yellow", field_reverse: true},
         {rel: "pre_modifier", css_class: "color_azure"},
         "_",
         {rel: "post_modifier", css_class: "color_red"}],

        ["_", {rel: "subject", css_class: "color_blue", field_reverse: true, alt_label: "vb"}],
        [{rel: "object", css_class: "color_purple", field_reverse: true, alt_label: "vb"}, "_"]
    ],
    adjective: [["_", {rel: "pre_modifier", css_class: "color_yellow", field_reverse: true}]],
    adverb: [["_", {rel: "adverbial", css_class: "color_yellow", field_reverse: true}]],
    preposition: [["_", {rel: "preposition_rel", css_class: "color_green"}]]

}

settings.visibleModes = 6
settings.modeConfig = [
    {
        localekey: "modern_texts",
        mode: "default"
    },
    {
        localekey: "swedish_texts",
        mode: "swedish",
        labOnly: true
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
        localekey: "kubhist",
        mode: "kubhist"
    },
    {
        localekey: "all_hist",
        mode: "all_hist",
    },
    {
        localekey: "spf_texts",
        mode: "spf"
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
    },
    {
        localekey: "kioping_texts",
        mode: "kioping_books",
    },
    {
        localekey: "runeberg",
        mode: "runeberg",
    },

    {
        localekey: "bible_texts",
        mode: "bible",
    },
    {
        localekey: "lawroom",
        mode: "law",
    },
    {
        localekey: "spanish_texts",
        mode: "spanish",
    },
    {
        localekey: "interfra",
        mode: "interfra"
    },
    {
        localekey: "bellman",
        mode: "bellman"
    },
    {
        localekey: "eddan",
        mode: "eddan"
    },
    {
        localekey: "somali",
        mode: "somali",
    }

];

settings.primaryColor = "rgb(221, 233, 255)";
settings.primaryLight = "rgb(242, 247, 255)";
settings.secondaryColor = "";

settings.defaultOverviewContext = "1 sentence"
settings.defaultReadingContext = "1 paragraph"

settings.defaultContext = {
    "1 sentence": "1 sentence"
};
settings.spContext = {
    "1 sentence": "1 sentence",
    "1 paragraph": "1 paragraph"
};
settings.defaultWithin = {
    "sentence": "sentence"
};
settings.spWithin = {
    "sentence": "sentence",
    "paragraph": "paragraph"
};

// for optimization purposes
settings.cqp_prio = ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'grundform', 'lemgram', 'saldo', 'word'];

settings.defaultOptions = {
    "is": "=",
    "is_not": "!=",
    "starts_with": "^=",
    "contains": "_=",
    "ends_with": "&=",
    "matches": "*=",
    "matches_not": "!*=",
}
settings.liteOptions = {
    "is": "=",
    "is_not": "!="
}
settings.setOptions = {
    "is": "contains",
    "is_not": "not contains"
};
settings.probabilitySetOptions = {
    "is": "highest_rank",
    "is_not": "not_highest_rank",
    "contains": "rank_contains",
    "contains_not": "not_rank_contains",
};
/*
 * MISC
 */
settings.cgi_script = "https://ws.spraakbanken.gu.se/ws/korp";
// settings.cgi_script = "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi";
settings.download_cgi_script = "https://ws.spraakbanken.gu.se/ws/korp/download";


// label values here represent translation keys.
settings.arg_groups = {
    "word": {
        word: {label: "word"}
    }
};

settings.mapCenter = {
  lat: 62.99515845212052,
  lng: 16.69921875,
  zoom: 4
};
