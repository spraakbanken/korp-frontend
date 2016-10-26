settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};

settings.corpora.kioping = {
    morf: 'swedbergm|dalinm|saldom',
    id: "kioping",
    title: "Nils Matsson Kiöpings resor",
    description: "Reseskildringar från 1674 och 1743",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: {
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
                "antikva",
                "smallcaps",
                "headline",
                "italic",
                "unclear",
                "gap"
                //"kustod"
            ],
            opts: settings.liteOptions

            }
    },

    struct_attributes: {
        text_date: {label: "date"},
        text_title: {
            label: "title",
            displayType: "select",
            localize: false,
            dataset: [
                "Een kort Beskriffning Uppå Trenne Reesor och Peregrinationer, sampt Konungarijket Japan",
                "BESKRIFNING Om En RESA GENOM ASIA, AFRICA Och många andra HEDNA LÄNDER "
            ],
            opts: settings.liteOptions
        },
        "chapter_name": {
            label: "chapter"
        },
    }
};

settings.corpusListing = new CorpusListing(settings.corpora);
