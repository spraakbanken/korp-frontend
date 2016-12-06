settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.wordpicture = false;
settings.enableMap = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};

// Skolböcker
settings.corporafolders.buugaag = {
    title: "Buugaag Dugsiyeed",
    contents: ["somali-1971-79", "somali-2001", "somali-hargeysa-2010", "somali-itoobiya", "somali-cb", "somali-hargeysa", "somali-saynis-1972-77", "somali-saynis-1994-96", "somali-saynis"]
};

settings.corpora["somali-1971-79"] = {
    id: "somali-1971-79",
    title: "Af Soomaali 1971–79",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_publisher: {label: "publisher"},
        text_source: {label: "source", type: "url"},
        page_n: {label: "page"},
        page_purl: {label: "pagesource", type: "url"}
    }
};

settings.corpora["somali-2001"] = {
    id: "somali-2001",
    title: "Af-Soomaali 2001",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_sponsor: {label: "sponsor"},
        text_place: {label: "place"},
        page_n: {label: "page"},
        text_edition: {label: "edition"}
    }
};

settings.corpora["somali-itoobiya"] = {
    id: "somali-itoobiya",
    title: "Af-Soomaali 2006 Itoobiya",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_publisher: {label: "publisher"},
        text_place: {label: "place"},
        page_n: {label: "page"}
    }
};

settings.corpora["somali-hargeysa-2010"] = {
    id: "somali-hargeysa-2010",
    title: "Af-Soomaali 2010 Hargeysa",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: {},
    struct_attributes: {
        text_edition: {label: "edition"},
        text_place: {label: "place"},
        text_publisher: {label: "publisher"},
        text_title: {label: "title"},
        text_year: {label: "year"},
        page_n: {label: "page"}
    }
};

settings.corpora["somali-hargeysa"] = {
    id: "somali-hargeysa",
    title: "Cilmiga Bulshada 2001 Hargeysa",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_publisher: {label: "publisher"},
        text_place: {label: "place"},
        text_editor: {label: "editor"},
        text_edition: {label: "edition"},
        text_sponsor: {label: "sponsor"},
        page_n: {label: "page"}
    }
};

settings.corpora["somali-bulsho"] = {
    id: "somali-bulsho",
    title: "Bulsho",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_source: {label: "source", type: "url"},
        text_publisher: {label: "publisher"},
        text_place: {label: "place"}
    }
};

settings.corpora["somali-cb"] = {
    id: "somali-cb",
    title: "Cilmiga Bulshada 1971–1980",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_source: {label: "source", type: "url"},
        text_publisher: {label: "publisher"},
        text_place: {label: "place"}
    }
};

settings.corpora["somali-cilmi"] = {
    id: "somali-cilmi",
    title: "Cilmi-Afeed",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_editor: {label: "editor"},
        text_publisher: {label: "publisher"},
        text_place: {label: "place"},
        text_edition: {label: "edition"},
        page_n: {label: "page"}
    }
};

settings.corpora["somali-wakiillada"] = {
    id: "somali-wakiillada",
    title: "Golaha Wakiillada Somaliland",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: {},
    struct_attributes: {
        text_date: {label: "date"},
        text_title: {label: "title"},
        text_source: {label: "source", type: "url"},
        text_publisher: {label: "publisher"},
        text_place: {label: "place"}
    }
};

settings.corpora["somali-kqa"] = {
    id: "somali-kqa",
    title: "Kitaabka Quduuska Ah",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_title: {label: "title"},
        text_sponsor: {label: "sponsor"},
        text_place: {label: "place"},
        text_edition: {label: "edition"},
        text_date: {label: "year"},
        text_source: {label: "source", type: "url"}
    }
};

settings.corpora["somali-ogaden"] = {
    id: "somali-ogaden",
    title: "Ogaden Online",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_source: {label: "source", type: "url"},
        page_purl: {label: "pagesource", type: "url"}
    }
};

settings.corpora["somali-qoraallo"] = {
    id: "somali-qoraallo",
    title: "Qoraallo 1956-1970",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_date: {label: "date"},
        text_title: {label: "title"},
        text_author: {label: "author"},
        text_place: {label: "place"},
        text_source: {label: "source", type: "url"}
    }
};

settings.corpora["somali-saynis"] = {
    id: "somali-saynis",
    title: "Saynis 2001 Hargeysa",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_publisher: {label: "publisher"},
        text_place: {label: "place"},
        text_editor: {label: "editor"},
        text_edition: {label: "edition"},
        text_sponsor: {label: "sponsor"},
        page_n: {label: "page"}
    }
};

settings.corpora["somali-radioden2014"] = {
    id: "somali-radioden2014",
    title: "Raadiyaha Denmark 2014",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_publisher: {label: "publisher"},
        text_place: {label: "place"},
        text_date: {label: "date"},
        text_source: {label: "source", type: "url"}
    }
};

settings.corpora["somali-radioswe2014"] = {
    id: "somali-radioswe2014",
    title: "Raadiyaha Iswiidhan 2014",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: {},
    struct_attributes: {
        text_publisher: {label: "publisher"},
        text_place: {label: "place"},
        text_date: {label: "date"},
        text_source: {label: "source", type: "url"}
    }
};


settings.corpora["somali-saynis-1972-77"] = {
    id: "somali-saynis-1972-77",
    title: "Saynis 1972–77",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_edition: {label: "edition"},
        text_editor: {label: "editor"},
        text_place: {label: "place"},
        text_publisher: {label: "publisher"},
        text_source: {label: "source", type: "url"},
        text_title: {label: "title"},
        text_year: {label: "year"},
        page_n: {label: "page"}
    }
};

settings.corpora["somali-saynis-1994-96"] = {
    id: "somali-saynis-1994-96",
    title: "Saynis 1994–96",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_edition: {label: "edition"},
        text_editor: {label: "editor"},
        text_place: {label: "place"},
        text_publisher: {label: "publisher"},
        text_source: {label: "source", type: "url"},
        text_title: {label: "title"},
        text_year: {label: "year"},
        page_n: {label: "page"}
    }
};

settings.corpora["somali-sheekooyin"] = {
    id: "somali-sheekooyin",
    title: "Sheekooyin Carruureed",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_title: {label: "title"},
        text_date: {label: "year"},
        text_publisher: {label: "publisher"},
        text_source: {label: "source", type: "url"}
    }
};

settings.corpora["somali-faces"] = {
    id: "somali-faces",
    title: "Somali Faces",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        page_n: {label: "page"},
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_publisher: {label: "publisher"},
        text_source: {label: "source", type: "url"},
        page_purl: {label: "pagesource", type: "url"}
    }
};

settings.corpora["somali-suugaan"] = {
    id: "somali-suugaan",
    title: "Suugaan",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_place: {label: "place"},
        text_author: {label: "author"},
        text_edition: {label: "edition"}
    }
};

settings.corpora["wikipedia-so"] = {
    id: "wikipedia-so",
    title: "Somali Wikipedia",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {},
    struct_attributes: {
        text_title: {label: "title"},
        text_publisher: {label: "date"},
        text_source: {label: "source", type: "url"}
    }
};

settings.corpora["somali-xeerar"] = {
    id: "somali-xeerar",
    title: "Xeerar Somaliland",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: {},
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_source: {label: "source", type: "url"},
        text_publisher: {label: "publisher"},
        text_place: {label: "place"}
    }
};

settings.corpusListing = new CorpusListing(settings.corpora);
