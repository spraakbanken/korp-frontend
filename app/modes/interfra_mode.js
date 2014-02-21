settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
//$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};

settings.corpora.interfra = {
	id : "interfra",
	title : "InterFra",
	description : "",
	within : settings.spWithin,
	context : settings.spContext,
	attributes : {
	},
	struct_attributes : {
		"u_who" : {label : "speaker"},
		"text_part" : {label : "part"},
		"text_group" : {label : "group"},
		"text_activity" : {label : "activity"},
		"text_interviewee" : {label : "interviewee"},
		"text_activity_date" : {label : "date"}/*,
		"text_transcriber" : {label : ""},
		"text_transcription_date" : {label : ""},
		"text_transcription_checker" : {label : ""},
		"text_check_date" : {label : ""}*/
	},
};

settings.corpusListing = new CorpusListing(settings.corpora);
