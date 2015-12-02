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
	context : settings.defaultContext,
	attributes : {
        pos : {label : "pos"},
        msd : attrs.msd,
        lemma : attrs.baseform,
        dephead : attrs.dephead,
        deprel : {label : "deprel"},
        ref : attrs.ref
    },
	struct_attributes : {},
};

settings.corpusListing = new CorpusListing(settings.corpora);
