settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.lsi = {
	id : "lsi",
	title : "LSI",
	description : "",
	limited_access : true,
	languages : {
		lsi : "english"
	},
	within : settings.defaultWithin,
	context : {
	"1 sentence" : "1 sentence",
    "7 sentence" : "7 sentence"
    },
	attributes : {
	    norm : {label: "normalized_wordform"},
        pos : {label : "pos"},
        msd : attrs.msd,
        lemma : {label: "baseform"},
        dephead : attrs.dephead,
        deprel : {label : "deprel"},
        ref : attrs.ref
    },
	struct_attributes : {
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
	    "corpus_part": {label: "part"}
	}
};

settings.corpusListing = new CorpusListing(settings.corpora);
