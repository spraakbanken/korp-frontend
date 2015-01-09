settings.primaryColor = "#F7D1E4";
settings.primaryLight = "#FFEBF5";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

settings.fsvattributes = {
	lemma : settings.fsvlemma,
	lex : settings.fsvlex,
	posset : settings.posset,
	variants : settings.fsvvariants
};

settings.sdhkstructs = {
	text_id : {
		label : "fulltext",
		pattern : "<a href='http://www.nad.riksarkivet.se/SDHK?EndastDigitaliserat=false&SDHK=<%= val %>&page=1&postid=Dipl_<%= val %>&tab=post' target='_blank'>Riksarkivet <%=val %></a>",
		opts : settings.liteOptions,
		internalSearch : false
	},
	text_lang : { label : "lang" },
	text_place : { label : "city" },
	text_date : { label : "date" },
};

settings.sdhkdescription ='Svenskt Diplomatarium - från <a href="http://www.riksarkivet.se/sdhk" target="_blank">Riksarkivet</a>';


$("#lemgram_list_item").remove();
//$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};


// if(isLab){
settings.corporafolders.fsvb = {
	title : "Fornsvenska textbanken",
	contents : ["fsv-profanprosa", "fsv-verser"],
};


settings.corporafolders.fsvb.aldre = {
	title : "Äldre fornsvenska",
	contents : ["fsv-aldrelagar", "fsv-aldrereligiosprosa"]
};

settings.corporafolders.fsvb.yngre = {
	title : "Yngre fornsvenska",
	contents : ["fsv-yngrelagar", "fsv-yngrereligiosprosa", "fsv-yngretankebocker"]
};

settings.corporafolders.fsvb.nysvenska = {
	title : "Nysvenska",
	contents : ["fsv-nysvensklagar", "fsv-nysvenskdalin", "fsv-nysvenskkronikor", "fsv-nysvenskovrigt", "fsv-nysvenskbibel"]
};

settings.corporafolders.medeltid = {
	title : "Medeltidsbrev, Svenskt Diplomatarium",
	contents : ["sdhk-svenska", "sdhk-norska", "sdhk-tyska", "sdhk-latin", "sdhk-ovrigt"],
};

settings.corpora["fsv-aldrelagar"] = fsv_aldrelagar;

settings.corpora["fsv-aldrereligiosprosa"] = {
    morf : 'fsvm',
	id : "fsv-aldrereligiosprosa",
	title : "Äldre religiös prosa – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.fsvattributes,
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Birgittaautograferna",
				"Fornsvenska legendariet enligt Codex Bureanus",
				"Pentateuchparafrasen, enligt MB I A",
				"Pentateuchparafrasen B, enligt MB I B",
				"Fornsvenska legendariet enligt Codex Bildstenianus"
			],
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-profanprosa"] = {
    morf : 'fsvm',
 	id : "fsv-profanprosa",
	title : "Profan prosa – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.fsvattributes,
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Barlaam och Josaphat, ur Codex Holm A 49 Nådendals klosterbok",
				"Sju vise mästare B, Nådendals klosterbok, Codex Holm A 49",
				"Didrik av Bern, hand A",
   	   	   	   	"Sverige krönika, eller Prosaiska krönikan efter Holm D 26",
				"Konungastyrelsen, Bureus utgåva",
				"Didrik av Bern, hand B",
				"Namnlös och Valentin, ur Codex Holm D 4a",
				"Sju vise mästare C, efter Codex Askabyensis",
				"Historia Trojana, ur Codex Holm D 3a",
				"Sju vise mästare A, ur Codex Holm D 4"
                                ]
			},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-verser"] = {
    morf : 'fsvm',
	id : "fsv-verser",
	title : "Verser – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.fsvattributes,
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Fornsvenska Ordspråk",
				"Erikskrönikan, ur Spegelbergs bok, Codex Holm D2" ,
				"Fredrik av Normandie",
				"Ivan Lejonriddaren, ur SFSS Bd 50 Uppsala 1931",
				"Flores och Blanzeflor",
				"Karlskrönikan"
			]
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-yngrelagar"] = fsv_yngrelagar;

settings.corpora["fsv-yngrereligiosprosa"] = {
	id : "fsv-yngrereligiosprosa",
    morf : 'fsvm',
	title : "Yngre religiös prosa – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.fsvattributes,
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Johannes döparens födelse ur Codex Bildstenianus Ups C 528",
				"Jesu lidandes bägare och hans blods utgjutelse",
				"Svenska Medeltidspostillor 1, enligt AM 787",
				"Esthers bok, ur Codex Holm A1",
				"Gregorius av Armenien B, ur Codex Holm A 49 Nådendals klosterbok",
				"Legenden om Sankt Sigfrid, ur Codex Bilstenianus",
				"Legenden om Sankta Jakelina, ur Linköpingslegendariet, Benz 39",
				"S.Johannis Theologi uppenbarelse",
				"Legenden om Sankta Elisabet av Brabant, ur Linköpingslegendariet, Benz 39",
				"Legenden om Sankta Elisabet av Ungern",
				"Legenden om Sankt Joakim, ur Codex Holm A 3",
				"Sankta Anna, enligt Codex Benz 9",
				"Sancta Clara, ur Codex Oxenstiernianus",
				"Sancti Marci Euangelium",
				"Legenden om Sankta Tekla, ur Linköpingslegendariet, Benz 39",
				"Om Erik den helige, efter Codex Vat Reg Lat 525",
				"Legenden om Stephanus påve, ur Linköpingslegendariet, Benz 39, översatt av Herr Jöns Ewangelista",
				"Legenden om Sankt Germanus och Genoveva, ur Codex Holm A 49 Nådendals klosterbok",
				"Legender om Germanus \\(2\\), ur Codex Holm A 49 Nådendals klosterbok",
				"Utdrag ur Legenden om St Mektild, ur Lund Mh 20",
				"Legenden om Sankt Paulus omvändelse, ur Codex Bildstenianus",
				"Legenden om Maria ov Oegnies",
				"Svenska Medeltidspostillor 5, enligt Linc T 181",
				"Legenden om Sankta Felicula och Petronella, ur Linköpingslegendariet, Benz 39'",
				"Legenden om Katarina av Egypten, ur Codex Holm A 3",
				"Svenska Medeltidspostillor 2, enligt Lund Mh 51 och HUB",
				"Legenden om Sankt Alexius ur Linköpingslegendariet",
				"Birgittas uppenbarelser, Sju stycken, fordom i Codex Bergmannius, Lund Mh 20",
				"Birgittas uppenbarelser, återöversättningen, första redaktionen, Bok 7",
				"Sancti Joannisoppenbarilse",
				"Gregorius Stylista, eller Gregorius på stenen, ur Linköpingslegendariet, Benz 39",
				"Själens kloster,översatt av Jöns Budde",
				"Sankt Ansgarii leverne av Rimbertus, ur Codex Holm A 49 Nådendals klosterbok",
				"Vår herres födelse, ur Codex Holm A 3",
				"Bonaventura, kapitel 6",
				"Exodus 16, ur Holm A3",
				"S Stephani saga, ur Linköpingslegendariet, Benz 39, översatt av Johannes Mathei",
				"Ängelens diktamen, ur Codex Oxenstiernianus",
				"Järteckensboken, ur Codex Oxenstiernianus",
				"Gregorius av Armenien A, ur Codex Bergmannius, Lund Mh 20",
				"Legender om Briccius",
				"Legenden om Sankt Macarius Romanus",
				"Legenden om Sankta Amalberga",
				"Legenden om Sankta Phara, ur Linköpingslegendariet, Benz 39",
				"Legenden om Sankta Maria \\(F\\)",
				"Legenden om Sankta Maria \\(E\\), ur Codex Holm A 3",
				"Den heliga Elisabet av Ungerns uppenbarelser A",
				"Patrikssagan, efter Codex Bildstenianus \\(Ups C 528\\)",
				"Bonaventuras betraktelser, Kapitel 7 ur Holm A 3",
				"Sagan om den helige Blasius, ur Codex Oxenstiernianus",
				"Heliga Birgittas uppenbarelser ur Codex Oxenstiernianus",
				"Birgittas uppenbarelser, åttonde boken, ur Cod Holm A 44",
				"Nicodemi evangelium enligt Codex Oxenstiernianus",
				"Apostla gernigar, ur Codex Oxenstiernianus",
				"Judits bok, ur Codex Holm A 1",
				"Lucidarius, redaktion B, ur Holm A 58, Jöns Buddes bok",
				"Sanct Bartholomei moder, eller Kvinnan utan händer, ur Linköpingslegendariet, översatt av Karl Benedictsson",
				"Codex Bildstenianus; strödda legender Hand I",
				"Regula Salvatoris och Revelationes Extravagantes, ur Berlin KB 3762",
				"Legenden om Sankt Albinus",
				"Birgittas uppenbarelser, Birgittinernorska efter Skokloster 5 kvart",
				"Legenden om Erik den helige, ur Codex Bildstenianus Ups C 528",
				"Legenden om Sankta Joleida, ur Linköpingslegendariet, Benz 39",
				"Birgittas uppenbarelser, återöversättingen, andra redaktionen, Bok 4-8",
				"Den heliga Birgittas liv, Vita abbreviata ur Holm A 33",
				"Legenden om Sankta Macra, ur Nådendals klosterbok",
				"Legenden om Johannes Chrysostomus, ur Linköpingslegendariet, Benz 39",
				"Ruths bok, enligt Holm A 1",
				"Legenden om Germanus \\(1b\\), ur Codex Bildstenianus Ups C 528",
				"Elisabet av Ungerns uppenbarelser B",
				"Legender om Genoveva, ur Codex Holm A 49 Nådendals klosterbok",
				"Legenden om Olav den helige, ur Codex Bildstenianus",
				"Stimulus Amoris, efter Cod Holm A 9",
				"Sjusovaresagan, ur Linköpingslegendariet, Benz 39",
				"Katarina av Sverige, ur Codex Holm A 58, Jöns Buddes bok",
				"Legenden om Sankta Rakel, ur Linköpingslegendariet, Benz 39",
				"Birgittas uppenbarelser Bok 1-3, ur Codex Holm A 33",
				"Legeneden om Magnus Jarl av Okenöarna",
				"Bonaventuras betraktelser, Codex Bergmannius, Lund Mh 20",
				"Vitæpatrum - Helga manna lefverne, ur Codex Oxenstiernianus",
				"Legenden om Sankta Otilia, ur Linköpingslegendariet, Benz 39",
				"Heliga Barbara, ur Codex Oxenstiernianus",
				"Legenden om Paulus och Johannes, ur Codex Bildstenianus, hand IV",
				"Själens tröst, ur Codex Holm A 108",
				"Sankt Emerentia och Sankt Anna; översatt från tyska av Lars Elfsson ur Linköpingslegendariet, Benz 39",
				"Karl Magnus, enl Cod Holm D 4",
				"Legenden om Blasius \\(1b\\) ur Ups C 528",
				"Legenden om tre konungar, ur Ups C 528",
				"Legenden om Sankt Servacius",
				"Bonaventuras betraktelser, kapitel 63 ur Holm A 3"
			],
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-yngretankebocker"] = {
    morf : 'fsvm',
	id : "fsv-yngretankebocker",
	title : "Yngre tankeböcker – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.fsvattributes,
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Läkebok 1: blandad läkedom, ur Codex AM",
				"Läkebok 11: Månaderna, efter KBs handskrift med gammal signatur K 45, supplerad på Danska ur codex Grensholmensis",
				"Läkebok, 8 ur codex Grensholmensis i Linköping",
				"Läkebok 4, ur Codex Holm A 49",
				"Läkebok 2, ur pappershandskriften Ups C 601",
				"Bondakonst av Peder Månsson",
    	    	    	    	"Läkedomar, codex Ups Benz 22",
				"Läkebok 5 och 6, ur Codex 19 Benz",
				"Läkebok 7, efter Codex linc M 5",
				"Läkebok 10: Zoodiaken, månaderna m m, efter hskr i Rålambska samlingen",
				"Läkedom, efter Peder Månssons handskrift i Linköpings Stiftsbibliotek"
			],
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-nysvenskbibel"] = {
 
	id : "fsv-nysvenskbibel",
	title : "Nysvenska bibelböcker – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {pos: attrs.pos},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Gustav Vasas Bibel, Markusevanguliet",
				"Gustav Vasas Bibel, Lukasevangeliet"
			]
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-nysvenskdalin"] = {
	id : "fsv-nysvenskdalin",
	title : "Dalin: then swänska argus – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {pos: attrs.pos},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Dalin: Then Swänska Argus"
			],
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-nysvenskkronikor"] = {
	id : "fsv-nysvenskkronikor",
	title : "Nysvenska krönikor – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {pos: attrs.pos},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Peder Swarts krönika",
				"Per Brahes krönika",
				"Olaus Petris Krönika, stil B",
				"Olaus Petris Krönika, stil A",
				"Olaus Petris Krönika"
			],
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-nysvenskovrigt"] = {
	id : "fsv-nysvenskovrigt",
	title : "Nysvenska, övrigt – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {pos: attrs.pos},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Runius: Prosastycken",
				"Mag. Joh. Qvirfelds himmelska örtegårds-sällskap",
				"Gyllenborg: Svenska sprätthöken",
				"Jon Stålhammars brev",
				"Agneta Horns levnadsbeskrivning",
				"Beskrifning öfwer Sweriges Lapmarker 1747 av Pehr Högström, kap 1-4",
				"AnnaVasas brev",
				"Carl Carlsson Gyllenhielms anteckningar",
				"Samuel Columbus: Mål-roo eller Roo-mål",
				"Haqvin Spegel: Dagbok",
				"UrbanHiärne: Stratonice"
			],
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-nysvensklagar"] = {
	id : "fsv-nysvensklagar",
	title : "Nysvenska lagar – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : {
	            pos: attrs.pos
        },
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : [
				"Missgiernings Balk",
				"Giftermåls balk \\(1734\\)",
			],
		},
		text_date : {label : "date"}
	}
};

// if(isLab){
settings.corpora["sdhk-svenska"] = {
	id : "sdhk-svenska",
	title : "Medeltidsbrev - Svenska",
	description : settings.sdhkdescription,
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : settings.sdhkstructs
};

settings.corpora["sdhk-norska"] = {
	id : "sdhk-norska",
	title : "Medeltidsbrev - Norska",
	description : settings.sdhkdescription,
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : settings.sdhkstructs
};

settings.corpora["sdhk-tyska"] = {
	id : "sdhk-tyska",
	title : "Medeltidsbrev - Tyska",
	description : settings.sdhkdescription,
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : settings.sdhkstructs
};

settings.corpora["sdhk-latin"] = {
	id : "sdhk-latin",
	title : "Medeltidsbrev - Latin",
	description : settings.sdhkdescription,
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : settings.sdhkstructs
};

settings.corpora["sdhk-ovrigt"] = {
	id : "sdhk-ovrigt",
	title : "Medeltidsbrev - Övriga språk",
	description : settings.sdhkdescription,
	within : settings.defaultWithin,
	context : settings.defaultContext,
	attributes : {},
	struct_attributes : settings.sdhkstructs
};
// }

settings.corpusListing = new CorpusListing(settings.corpora);

