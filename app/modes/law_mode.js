settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
settings.wordpicture = false;


$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corporafolders.modern = {
    title: "Moderna lagar och rättsfall",
    contents: ["sfs", "moderntdv"]
};

settings.corporafolders.lag1700 = {
    title: "1734 års lag och förarbeten",
    contents: ["lag1734", "forarbeten1734"]
};

settings.corporafolders.fsvlagar = {
    title: "Fornsvenska textbankens lagtexter",
    contents: ["fsv-aldrelagar", "fsv-yngrelagar"]
};


settings.corpora["fsv-yngrelagar"] = fsv_yngrelagar;

settings.corpora["fsv-aldrelagar"] = fsv_aldrelagar;


settings.corpora["tankebok"] = {
    morf: 'swedbergm|dalinm',
    id: "tankebok",
    title: "Stockholms stads tänkeböcker",
    description: "Stockholms stads tänkeböcker från 1626",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        posset:  settings.posset,
        lemma: attrs.baseform,
        lex: attrs.lemgram
    },
    struct_attributes: {
        text_date: {label: "date"},
        text_title: {
            label: "title",
            displayType: "select",
            localize: false,
            dataset: [
                "Stockholms stads tänkebok - Koncept ",
                "Stockholms stads tänkebok - Notariat",
                "Stockholms stads tänkebok - Renskr "
            ],
            opts: settings.liteOptions

        },
        paragraph_marginal: {label: "paragraph_marginal"}
    }
};


settings.corpora["lag1734"] = {
    morf: 'swedbergm|dalinm',
    id: "lag1734",
    title: "1734 års lag",
    description: "Materialet utgörs av balkarna i själva lagtexten, förordet samt domarreglerna. Materialet är inskrivet för hand och korrekturläst, men en del fel finns fortfarande kvar.",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        typograph: {
            label: "typography",
            type: "set",
            displayType: "select",
            translationKey: "fab_",
            dataset: [
                "bold",
                "smallcaps",
                "headline",
                "marginal",
                "footnote",
                "italic",
                "emphasis"
            ],
            opts: settings.liteOptions
        },
    },
    struct_attributes: {
        //paragraph_marginal: {label: "paragraph_marginal"},
        text_date: {label: "date"},
        text_title: {
            label: "title",
            displayType: "select",
            localize: false,
            dataset: [
                "1734 års lag Förord",
                "1734 års lag Domareregler",
                "1734 års lag Lagtext",
            ],
            opts: settings.liteOptions
        }
    }
};

settings.corpora["forarbeten1734"] = {
    morf: 'swedbergm|dalinm',
    id: "forarbeten1734",
    title: "Förarbeten",
    description: "Förarbetena till 1734 års lag utgörs av material från lagkommissionen till 1734 års lag. Materialet är från 1686–1735, utgivet av Vilhelsm Sjögren 1900–1909. Materialet utgörs av protokoll från sammanträdena (vol. 1–3); lagkommissionens förslag (vol. 4 –6); utlåtanden över lagkommissionens förslag (vol. 7) samt riksdagshandlingar angående lagkommissionens förslag (vol. 8). Materialet är OCR-skannat med manuell efterarbetning.",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        typograph: {
            label: "typography",
            type: "set",
            displayType: "select",
            translationKey: "fab_",
            dataset: [
                "bold",
                "smallcaps",
                "headline",
                "marginal",
                "footnote",
                "italic",
                "emphasis"
            ],
            opts: settings.liteOptions
        },
    },
    struct_attributes: {
        //paragraph_marginal: {label: "paragraph_marginal"},
        text_date: {label: "date"},
        text_title: {
            label: "title",
            displayType: "select",
            localize: false,
            dataset: [
                "1734 års lag Förarbeten vol 1",
                "1734 års lag Förarbeten vol 2",
                "1734 års lag Förarbeten vol 3",
                "1734 års lag Förarbeten vol 4",
                "1734 års lag Förarbeten vol 5",
                "1734 års lag Förarbeten vol 6",
                "1734 års lag Förarbeten vol 7",
                "1734 års lag Förarbeten vol 8"
            ],
            opts: settings.liteOptions
        }
    }
};

settings.corpora["lag1800"] = {
    morf: 'saldom|dalinm',
    id: "lag1800",
    title: "Lagar från 1800-talet",
    description: "Regeringsformen 1809 med ändringar 1809-1974, Författningssamling Låssa kyrkas arkiv 1800",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        posset:  settings.posset,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        prefix: attrs.prefix,
        suffix: attrs.suffix
    },
    struct_attributes: {
        text_title: {
            localize: false,
            label: "title",
            displayType: "select",
            dataset: [
                "Författningssamling 1800 Låssa kyrkas arkiv",
                "Regeringsformen 1809 "
            ],
            opts: settings.liteOptions
        },
        text_date: {label: "date"},
        text_marginal: {label: "paragraph_marginal"}
    }
};

settings.corpora["sfs"] = {
    id: "sfs",
    title: "Svensk författningssamling",
    description: "",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        posset: settings.posset,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        prefix: attrs.prefix,
        suffix: attrs.suffix,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref
    },
    struct_attributes: {
        text_date: {label: "date"},
        text_title: {label: "title"}
    }
};
settings.corpora["moderntdv"] = {
    id: "moderntdv",
    title: "Domar",
    description: "",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        posset: settings.posset,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        prefix: attrs.prefix,
        suffix: attrs.suffix,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref
    },
    struct_attributes: {
        text_date: {label: "date"},
        text_title: {label: "title"}
    }
};



settings.corpusListing = new CorpusListing(settings.corpora);
