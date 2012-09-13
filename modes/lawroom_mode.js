
settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.fsvlagrummetnew = {
	id : "fsvlagrummetnew",
	title : "Fornsvenska textbankens lagtexter",
	description : "",
	within : settings.defaultWithin,
	attributes : {},
	struct_attributes : {
		text_date : {
			label : "date"
		},
		text_title : {
			label : "title"
		}
	}
};
settings.corpora["lag1734"] = {
		id : "lag1734",
		title : "1734 års lag",
		description : "",
		within : settings.defaultWithin,
		attributes : {},
		struct_attributes : {
			text_date : {
				label : "date"
			},
			text_title : {
				label : "title"
			}
		}
};
settings.corpora["tankebok"] = {
		id : "tankebok",
		title : "Tankebok",
		description : "",
		within : settings.defaultWithin,
		attributes : {},
		struct_attributes : {
			text_date : {
				label : "date"
			},
			text_title : {
				label : "title"
			}
		}
};

settings.corpusListing = new CorpusListing(settings.corpora);