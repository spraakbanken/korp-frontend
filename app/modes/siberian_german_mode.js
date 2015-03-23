settings.primaryColor = "#FFE7D2";
settings.primaryLight = "#FFF4EB";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.siberiangermandialogs = {
	id : "siberiangermandialogs",
	title : "Sibirientyska",
	description : "Sibirientyska är nedtecknad talad tyska som talas idag av c:a 36 000 människor i regionen Krasnojarsk i Sibirien (Ryssland). Korpusen har c:a 34 000 ord. Ryska ord och alla verbformer har annoterats (ryska ord och hybrider står i parentes; böjda verbformer får attribut FINIT eller INFIN). Sibirientyska ingår i ett <a href=\"http://www.sprak.gu.se/kontakta-oss/larare/andersen-christiane/syntax-in-contact/\">samarbetsprojekt</a> mellan Göteborgs universitet och Astafjev universitet i Krasnojarsk.<br><br>Siberian German is transcribed German spoken of about 36 000 people in the region of Krasnoyarsk in Siberia (Russia). The corpus consists of about 34 000 words. Russian words and all verb forms are annotated (Russian words and hybrids are given in brackets; verb forms have the attribute FINIT or INFIN). The SGC has been achieved in <a href=\"http://www.sprak.gu.se/kontakta-oss/larare/andersen-christiane/syntax-in-contact/\">cooperation</a> with the Astafyev University in Krasnoyarsk.",
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
