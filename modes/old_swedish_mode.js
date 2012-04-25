
settings.primaryColor = "#F7D1E4";
settings.primaryLight = "#FFEBF5";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();


settings.corpora = {};
settings.corporafolders = {};
settings.corpora.fornsvenska = {
	title : "Fornsvenska",
	description : "Fornsvenska texter",
               languages : {
		FORNSVENSKA : "svenska"
	},
	within : within.defaultStruct,
	attributes : {},
	struct_attributes : {
		"text_title" : {label : "title"},
		"text_datefrom" : {label : "year_from"},
		"text_dateto" : {label : "year_to"},
	}
};

