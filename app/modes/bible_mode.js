
settings.primaryColor = "#F9D4D4";
settings.primaryLight = "#F9EDED";
settings.autocomplete = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();


settings.corpora = {};
settings.corporafolders = {};


settings.corpora.bibel1917 = {
    id: "bibel1917",
    title: "Bibeln 1917",
    description: "",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        pos: attrs.pos,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        prefix: attrs.prefix,
        suffix: attrs.suffix,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref,
        texttype: {
             label: "fab_texttype",
             type: "set",
             displayType: "select",
             translationKey: "fab_",
             dataset: [
                 "info",
                 "footnote",
             ],
             opts: settings.liteOptions
        
       },

    },
    struct_attributes: {
        "text_title": {label: "chapter"},
        "text_subtitle": {label: "title"},
        "verse_name": {label: "verse"},
        "text_date": {label: "year"}
    }
};

settings.corpora.bibel1873dalin = {
    morf: 'saldom|dalinm|swedbergm',
    id: "bibel1873dalin",
    title: "Bibeln 1873",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        pos: attrs.pos,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        prefix: attrs.prefix,
        suffix: attrs.suffix,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref
        
    },
    struct_attributes: {
        "text_title": {label: "title"},
        "chapter_name": {label: "chapter"},
        "verse_name": {label: "verse"},
        "text_date": {label: "year"}
    }
};

settings.corpora["vasabibel-nt"] = {
    morf: 'swedbergm|dalinm|saldom',
    id: "vasabibel-nt",
    title: "Gustaf Vasas bibel - Nya testamentet",
    description: "'Nya Testamentet i Gustaf Vasas Bibel /under jämförelse med texten av år 1526 utgivet av Natan Lindqvist' från 1941",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: {
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        dalinlex: attrs.dalinlemgram,
        saldo: attrs.saldo,
        prefix: attrs.prefix,
        suffix: attrs.suffix,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref
    },
    struct_attributes: {
        text_title: {label: "title"},
        text_publisher: {label: "publisher"},
        text_published: {label: "published"},
        text_year: {label: "year"}
    }
};


settings.corpusListing = new CorpusListing(settings.corpora);
