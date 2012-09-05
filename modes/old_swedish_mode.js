
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
	id : "fornsvenska",
	title : "Fornsvenska textbankens material",
	description : '<a href="http://project2.sol.lu.se/fornsvenska/">Fornsvenska textbanken</a> är ett projekt som digitaliserar fornsvenska texter och gör dem tillgängliga över webben. Projektet leds av Lars-Olof Delsing vid Lunds universitet.',
	within : within.defaultStruct,
	attributes : {},
	struct_attributes : {
		"text_title" : {label : "title"},
		"text_datefrom" : {label : "year_from"},
		"text_dateto" : {label : "year_to"}
	}
};

settings.corpusListing = new CorpusListing(settings.corpora);