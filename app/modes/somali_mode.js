settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;
settings.enableMap = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.preselected_corpora = ["somali-1971-79", "somali-2001", "somali-bulsho", "somali-radioden2014", "somali-radioswe2014", "somali-sheekooyin", "somali-suugaan", "wikipedia-so"];

settings.corpora = {};
settings.corporafolders = {};
settings.corpora["somali-1971-79"] = {
	id : "somali-1971-79",
	title : "Af Soomaali 1971-79",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_year : {label : "year"},
		text_title : {label : "title"},
		text_publisher : {label : "publisher"},
		text_source : {label : "source", type : "url"},
		page_n : {label : "page"},
		page_purl : {label : "pagesource", type : "url"}
	}
};

settings.corpora["somali-2001"] = {
	id : "somali-2001",
	title : "Af-Soomaali 2001",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_year : {label : "year"},
		text_title : {label : "title"},
		text_sponsor : {label : "sponsor"},
		text_place : {label : "place"},
		page_n : {label : "page"},
		text_edition : {label : "edition"}
	}
};

settings.corpora["somali-bulsho"] = {
	id : "somali-bulsho",
	title : "Bulsho",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_year : {label : "year"},
		text_title : {label : "title"},
		text_source : {label : "source", type : "url"},
		text_publisher : {label : "publisher"},
		text_place : {label : "place"}
	}
};

settings.corpora["somali-kqa"] = {
	id : "somali-kqa",
	title : "Kitaabka Quduuska Ah",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_title : {label : "title"},
		text_sponsor : {label : "sponsor"},
		text_place : {label : "place"},
		text_edition : {label : "edition"},
		text_date : {label : "year"},
		text_source : {label : "source", type : "url"}
	}
};

settings.corpora["somali-radioden2014"] = {
	id : "somali-radioden2014",
	title : "Raadiyaha Denmark 2014",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
	    text_publisher : {label : "publisher"},
	    text_place : {label : "place"},
	    text_date : {label : "date"},
		text_source : {label : "source", type : "url"}
	}
};

settings.corpora["somali-radioswe2014"] = {
	id : "somali-radioswe2014",
	title : "Raadiyaha Iswiidhan 2014",
	description : "",
	within : settings.spWithin,
	context : settings.spContext,
	attributes : {},
	struct_attributes : {
	    text_publisher : {label : "publisher"},
	    text_place : {label : "place"},
	    text_date : {label : "date"},
		text_source : {label : "source", type : "url"}
	}
};

settings.corpora["somali-sheekooyin"] = {
	id : "somali-sheekooyin",
	title : "Sheekooyin Carruureed",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_title : {label : "title"},
		text_date : {label : "year"},
		text_publisher : {label : "publisher"},
		text_source : {label : "source", type : "url"}
	}
};

settings.corpora["somali-suugaan"] = {
	id : "somali-suugaan",
	title : "Suugaan",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_year : {label : "year"},
		text_title : {label : "title"},
		text_place : {label : "place"},
		text_author : {label : "author"},
		text_edition : {label : "edition"}
	}
};

settings.corpora["wikipedia-so"] = {
	id : "wikipedia-so",
	title : "Somaliska Wikipedia",
	description : "",
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : {
		text_title : {label : "title"},
		text_publisher : {label : "date"},
		text_source : {label : "source", type : "url"}
	}
};

settings.corpusListing = new CorpusListing(settings.corpora);
