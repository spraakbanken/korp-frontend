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
	description : "Sibirientyska är nedtecknad talad tyska som talas idag av c:a 36 000 människor i regionen Krasnojarsk i Sibirien (Ryssland). Texten har c:a 34 000 ord. Alla ryska ord och verbformer har annoterats (ryska ord står i parentes; böjda verbformer – FINIT/INFIN). Databasen befinner sig i testfasen och kommer att justeras i framtiden.<br/>Sibirientyska ingår i ett <a href=\"http://www.sprak.gu.se/kontakta-oss/larare/andersen-christiane/syntax-in-contact/\">samarbetsprojekt</a> mellan Göteborgs universitet och Astafjev universitet i Krasnojarsk.",
	languages : {
		siberiangermandialogs : "svenska"
	},
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {
		sib_de_msd : {
			label : "msd",
			displayType : "select",
			dataset : [
				"INFINIT",
				"INF",
				"FINIT"
			]
			
		}
	},
	struct_attributes : {},
};

settings.corpusListing = new CorpusListing(settings.corpora);
