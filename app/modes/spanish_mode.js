settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora["pe77"] = {
    id: "pe77",
    lang: "spa",
    title: "Banco de Datos de Prensa Española 1977 (SOL)",
    description: "spanska presstexter från tidskrifterna 'El País' och 'Triunfo'",
    context: settings.defaultContext,
    within: settings.defaultWithin,
    attributes: {
        pos: {label: "pos"},
        lemma: {label: "baseform"}
    },
    struct_attributes: {
        text_title: {label: "title"},
        text_lang: {
            label: "lang",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "spa": "spanish"
            }
        }
    }
};

settings.corpora["one71"] = {
    id: "one71",
    lang: "spa",
    title: "Banco de Datos de Once Novelas Españolas 1951—1971 (SOL)",
    description: "11 spanska noveller",
    context: settings.defaultContext,
    within: settings.defaultWithin,
    attributes: {
        pos: {label: "pos"},
        lemma: {label: "baseform"}
    },
    struct_attributes: {
        text_title: {label: "title"},
        text_lang: {
            label: "lang",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "spa": "spanish"
            }
        }
    }
};

settings.corpora["cor92"] = {
    id: "cor92",
    lang: "spa",
    title: "Corpus Oral de Referencia del Español Contemporáneo (SOL)",
    description: "spansk talkorpus",
    context: {"1 speaker": "1 speaker"},
    within: {"speaker": "speaker"},
    attributes: {
        pos: {label: "pos"},
        lemma: {label: "baseform"}
    },
    struct_attributes: {
        text_title: {label: "title"},
        text_source: {label: "source"},
        text_date: {label: "date"},
        text_location: {label: "location"},
        text_keywords: {label: "keywords"},
        speaker_id: {label: "id"},
        speaker_gender: {label: "gender"},
        speaker_age: {label: "age"},
        speaker_info: {label: "info"},
        text_lang: {
            label: "lang",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "spa": "spanish"
            }
        }
    }
};

settings.corpusListing = new CorpusListing(settings.corpora);
