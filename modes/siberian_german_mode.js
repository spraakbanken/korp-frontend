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
				"INFIN" : "INFIN",
				"FINIT" : "FINIT"
			}
				
		}
	},
	struct_attributes : {},
}