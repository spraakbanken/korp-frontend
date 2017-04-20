settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.dylan = {
    id: "dylan",
    title: "Bob Dylan",
    description: "",
    limitedAccess: true,
    within: spWithin,
    context: spContext,
    attributes: {
    },
    structAttributes: {
        "album_name": {label: "album"},
        "album_year": {label: "album_year"},
        "song_title": {label: "song_title"},
        "song_year": {label: "song_year"},
        "verse_nr": {label: "verse"}
    },
};

settings.corpusListing = new CorpusListing(settings.corpora);
