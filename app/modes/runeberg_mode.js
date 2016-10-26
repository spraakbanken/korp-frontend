
settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
settings.wordpicture = false;


$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};

settings.runebergattributes = {
    msd: attrs.msd,
    lemma: attrs.baseform,
    lex: attrs.lemgram,
    saldo: attrs.saldo,
    prefix: attrs.prefix,
    suffix: attrs.suffix,
    dephead: attrs.dephead,
    deprel: attrs.deprel,
    ref: attrs.ref,
    typograph: {
            label: "typography",
            type: "set",
        displayType: "select",
        translationKey: "fab_",
        dataset: [
            "footnote",
            "small",
            "headline",
            "italic"
            ],
        opts: settings.liteOptions
    }
};
settings.runebergstruct_attributes = {
    text_title: {
        label: "title",
        displayType: "select",
        localize: false,
         opts: settings.liteOptions
    },
    "chapter_name": {label: "chapter"},
    text_date: {label: "date"}
};


settings.corpora["runeberg-diverse"] = {
    morf: 'swedbergm|dalinm|saldom',
    id: "runeberg-diverse",
    title: "Diverse tidningar",
    description: "Brand, De ungas tidning, Det nya Sverige, Elegant, Hvar 8 dag, Nyare Conversations-Bladet, Sundsvalls tidning, Varia",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: settings.runebergattributes,
    struct_attributes: settings.runebergstruct_attributes,
};

settings.corpora["runeberg-rost"] = {
    morf: 'swedbergm|dalinm|saldom',
    id: "runeberg-rost",
    title: "Rösträtt för kvinnor",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: settings.runebergattributes,
    struct_attributes: settings.runebergstruct_attributes,
};

settings.corpora["runeberg-svtidskr"] = {
    morf: 'swedbergm|dalinm|saldom',
    id: "runeberg-svtidskr",
    title: "Svensk Tidskrift",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: settings.runebergattributes,
    struct_attributes: settings.runebergstruct_attributes,
};

settings.corpora["runeberg-tiden"] = {
    morf: 'swedbergm|dalinm|saldom',
    id: "runeberg-tiden",
    title: "Tiden",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: settings.runebergattributes,
    struct_attributes: settings.runebergstruct_attributes,

};

settings.corpora["runeberg-urdagkron"] = {
    morf: 'swedbergm|dalinm|saldom',
    id: "runeberg-urdagkron",
    title: "Ur Dagens Krönika",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: settings.runebergattributes,
    struct_attributes: settings.runebergstruct_attributes,
};




settings.corpusListing = new CorpusListing(settings.corpora);
