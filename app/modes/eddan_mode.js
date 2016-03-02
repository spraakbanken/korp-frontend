settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.eddan = {
    id : "eddan",
    title : "Äldre Eddan",
    description : "",
    languages : {
        eddan : "svenska"
    },
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : {},
    struct_attributes : {
        text_part: {
            label: "part"
        }
    },
};

settings.corpusListing = new CorpusListing(settings.corpora);
