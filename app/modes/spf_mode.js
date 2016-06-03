
settings.primaryColor = "#eecccc";
settings.primaryLight = "#eee2e2";
settings.autocomplete = true;
settings.lemgramSelect = true;
settings.wordpicture = true;

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.spf = {
    id: "spf",
    title: "Svensk prosafiktion 1800–1900",
    description: 'Samtliga etexter från <a href="http://spf1800-1900.se/">spf1800-1900.se</a>.',
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {
        pos: attrs.pos,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref,
        prefix: attrs.prefix,
        suffix: attrs.suffix
    },
    struct_attributes: {
        "text_title": {label: "title"},
        "text_author": {label: "author"},
        "text_url": {label: "verk", type: "url"},
        "text_source": {label: "source"},
        "text_date": {label: "imprintyear"},
        "page_n": {label: "page"},
        "page_url": {label: "pagelink", type: "url"}
    }
};

settings.corpusListing = new CorpusListing(settings.corpora);
