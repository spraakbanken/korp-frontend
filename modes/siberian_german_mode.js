settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.siberiangermandialogs = {
	id : "siberiangermandialogs",
	title : "Sibirientyska",
	description : "",
	languages : {
		siberiangermandialogs : "svenska"
	},
	within : within.defaultStruct,
	attributes : {
		sib_de_msd : {
			label : "msd",
			displayType : "select",
			dataset : {
				"INFINIT" : "INFINIT",
				"FINIT" : "FINIT"
			}
			
		}
	},
	struct_attributes : {},
};

settings.corpusListing = new CorpusListing(settings.corpora);