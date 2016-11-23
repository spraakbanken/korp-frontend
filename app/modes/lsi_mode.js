settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.wordpicture = false;

settings.mapCenter = {
  lat: 23.987825,
  lng: 78.223017,
  zoom: 4
}


$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.lsi = {
    id: "lsi",
    title: "LSI",
    description: "",
    limited_access: true,
    languages: {
        lsi: "english"
    },
    within: settings.defaultWithin,
    context: {
    "1 sentence": "1 sentence",
    "7 sentence": "7 sentence"
    },
    attributes: {
        norm: {label: "normalized_wordform"},
        pos: {label: "pos"},
        msd: attrs.msd,
        lemma: {label: "baseform"},
        dephead: attrs.dephead,
        deprel: {label: "deprel"},
        ref: attrs.ref
    },
    struct_attributes: {
        "page_pno": {label: "page"},
        "page_family": {label: "languagefamily"},
        "page_language": {label: "language"},
        "page_lsi_classification": {label: "lsi_classification"},
        "page_ethnologue_classification": {label: "ethnologue_classification"},
        "page_glottolog_classification": {label: "glottolog_classification"},
        "page_latitude": {label: "latitude"},
        "page_longitude": {label: "longitude"},
        "page_page_url": {label: "pagesource", type: "url"},
        "page_language": {label: "language"},
        "page_iso_code": {label: "iso_code"},
        "corpus_vol": {label: "volume"},
        "corpus_part": {label: "part"},
        "sentence_id": {label: "sentence"}
    },
    custom_attributes: {
        "image": {
            customType: "struct",
            renderItem: function(key, value, attrs, wordData, sentenceData, tokens) {
                var pageUrl = sentenceData["page_page_url"];
                var re = new RegExp("volume=(.*-.*)&pages=.*#page/(.*)/mode");
                var matches = pageUrl.match(re);
                var volumeName = matches[1];
                var pageNumber = matches[2];
                var src = 'https://spraakbanken.gu.se/korp/data/lsi/faksimil_thumb/thumb.lsi-v' + volumeName + '-' + ("00"+pageNumber).slice(-3) + '.jpg';
                var image = $('<img src="' + src + '">');
                var a = $('<a target="_blank" href="' + pageUrl + '"/>');
                var div = $('<div></div>');
                a.append(image);
                div.append(a);
                return div;
            }
        }
    }
};

settings.corpusListing = new CorpusListing(settings.corpora);
