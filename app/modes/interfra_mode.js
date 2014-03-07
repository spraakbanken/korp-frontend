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
		"text_part" : {
		    label : "part",
		    displayType : "select",
		    dataset : {"1A" : "1A", "1B" : "1B", "2" : "2"},
		    controller : selectType.controller,
		    extended_template : selectType.extended_template
		},
		"text_group" : {
		    label : "group",
		    displayType : "select",
		    dataset : {
                "G" : "Secondary school students (G)",
                "N" : "Beginners (N)",
                "L" : "1st and 2nd years’ university students (L)",
                "T" : "1st and 2nd years’ university students (T)",
                "R" : "Future teachers (R)",
                "D" : "PhD students (D)",
                "F" : "FSL juniors (F)",
                "Q" : "FSL seniors (Q)",
                "M" : "Multi-task group NNS (M)",
                "C" : "Erasmus exchange control group (C)",
                "J" : "Control group of junior NS (J)",
		        "S" : "Control group of senior NS (S)",
                "K" : "Multi-task control group (K)"
                },
		    controller : selectType.controller,
		    extended_template : selectType.extended_template
		},
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
