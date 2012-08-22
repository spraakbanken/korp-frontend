settings.primaryColor = "#EDFCD5";
settings.primaryLight = "#f7fceb";
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
			label : "msd"
		},
	},
	struct_attributes : {},
}