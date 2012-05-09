
settings.primaryColor = "#F9D4D4";
settings.primaryLight = "#F9EDED";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();


settings.corpora = {};
settings.corporafolders = {};
settings.corpora.bibel1917 = {
	title : "Bibeln 1917",
	description : "",
	languages : {
		BIBEL1917 : "svenska"
	},
	within : within.defaultStruct,
	attributes : {},
	struct_attributes : {
		"text_title" : {
			label : "title"
		},
		"text_datefrom" : {
			label : "year_from"
		},
		"text_dateto" : {
			label : "year_to"
		},
	}
};

settings.corpora.bibel1873 = {
	title : "Bibeln 1873",
	description : "",
	languages : {
		BIBEL1873 : "svenska"
	},
	within : within.defaultStruct,
	attributes : {},
	struct_attributes : {
		"text_title" : {
			label : "title"
		},
		"text_datefrom" : {
			label : "year_from"
		},
		"text_dateto" : {
			label : "year_to"
		},
	}
};