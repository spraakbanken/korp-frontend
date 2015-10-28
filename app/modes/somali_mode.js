settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.somali = {
	id : "somali",
	title : "Somaliska",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {},
};

settings.corpusListing = new CorpusListing(settings.corpora);
