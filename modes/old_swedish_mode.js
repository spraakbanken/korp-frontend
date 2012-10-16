settings.primaryColor = "#F7D1E4";
settings.primaryLight = "#FFEBF5";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;
settings.fsvdescription ='<a href="http://project2.sol.lu.se/fornsvenska/">Fornsvenska textbanken</a> är ett projekt som digitaliserar fornsvenska texter och gör dem tillgängliga över webben. Projektet leds av Lars-Olof Delsing vid Lunds universitet.';
settings.fsvattributes = {
  lemma : {
	pattern : "<a href='http://spraakbanken.gu.se/karp/#search=cql%7C(gf+%3D+%22%s%22)+sortBy+wf'>%s</a>",
  	type : "set",
  	label : "baseform"
  	},
  lex : {
  	type : "set",
  	label : "lemgram"
  	},
  fsvvariants : {
  	type : "set",
  	label : "variants"
  	}
  };



$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
//$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};

settings.corporafolders.aldre = {
	title : "Äldre fornsvenska",
	contents : ["fsv-aldrelagar", "fsv-aldrereligiosprosa"]
};

settings.corporafolders.yngre = {
	title : "Yngre fornsvenska",
	contents : ["fsv-yngrelagar",  "fsv-yngrereligiosprosa", "fsv-yngretankebocker"]
};

settings.corporafolders.nysvenska = {
	title : "Nysvenska",
	contents : ["fsv-nysvensklagar",  "fsv-nysvenskdalin", "fsv-nysvenskkronikor", "fsv-nysvenskovrigt", "fsv-nysvenskbibel"]
};

settings.corpora["fsv-aldrelagar"] = {
	id : "fsv-aldrelagar",
	title : "Äldre lagar – Fornsvenska textbankens material",
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
				"Yngre Västgötalagens äldsta fragment, Lydekini excerpter och anteckningar",
				"Södermannalagen, enligt Codex iuris Sudermannici",
				"Östgötalagen, fragment H, ur Kyrkobalken ur Skokloster Avdl I 145",
				"Yngre Västmannalagen, enl Holm B 57",
				"Vidhemsprästens anteckningar",
				"Magnus Erikssons Stadslag, exklusiva stadslagsflockar",
				"Södermannalagens additamenta, efter NKS 2237",
				"Hälsingelagen",
				"Yngre Västgötalagen, tillägg, enligt Holm B 58",
				"Östgötalagen, fragment C, ur Holm B 1709",
				"Yngre Västgötalagen, enligt Holm B 58",
				"Upplandslagen enl Schlyters utgåva och Codex Ups C 12, hskr A",
				"Skånelagen",
				"Östgötalagen, fragment D, ur Holm B 24",
				"Östgötalagen A, ur Holm B 50",
				"Äldre Västgötalagen",
				"Östgötalagen, fragment M, ur Holm B 196",
				"Gutalagen enligt Holm B 64",
				"Upplandslagen enligt Codex Holm B 199, Schlyters hskr B",
				"Gutalagens additamenta enligt AM 54",
				"Smålandslagens kyrkobalk",
				"Dalalagen (Äldre Västmannalagen)",
				"Tillägg till Upplandslagen, hskr A (Ups B 12)",
				"Bjärköarätten",
				"Magnus Erikssons Landslag",
				"Östgötalagen, fragment N, ur Köpenhamn AM 1056",
				"Södermannalagen stadsfästelse - Confirmatio, enligt NKS 2237",
				"Östgötalagen, fragment E, ur Ups B 22"
			],
        },	
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-aldrereligiosprosa"] = {
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
			dataset : {
				"Birgittaautograferna" : "Birgittaautograferna",
				"Fornsvenska legendariet enligt Codex Bureanus" : "Fornsvenska legendariet enligt Codex Bureanus",
				"Pentateuchparafrasen, enligt MB I A" : "Pentateuchparafrasen, enligt MB I A",
				"Pentateuchparafrasen B, enligt MB I B" : "Pentateuchparafrasen B, enligt MB I B",
				"Fornsvenska legendariet enligt Codex Bildstenianus" : "Fornsvenska legendariet enligt Codex Bildstenianus"
			},
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-profanprosa"] = {
 	id : "fsv-profanprosa",
	title : "Profan prosa – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.fsvattributes,
	struct_attributes : {
	}
};

settings.corpora["fsv-verser"] = {
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
			dataset : {
				"Fornsvenska Ordspråk" : "Fornsvenska Ordspråk",
				"Erikskrönikan, ur Spegelbergs bok, Codex Holm D2" : "Erikskrönikan, ur Spegelbergs bok, Codex Holm D2",
				"Fredrik av Normandie" : "Fredrik av Normandie",
				"Ivan Lejonriddaren, ur SFSS Bd 50 Uppsala 1931" : "Ivan Lejonriddaren, ur SFSS Bd 50 Uppsala 1931",
				"Flores och Blanzeflor" : "Flores och Blanzeflor",
				"Karlskrönikan" : "Karlskrönikan"
			},
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-yngrelagar"] = {
	id : "fsv-yngrelagar",
	title : "Yngre lagar – Fornsvenska textbankens material",
	description : settings.fsvdescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.fsvattributes,
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : {
				"Kristoffers Landslag, innehållsligt ändrade flockar i förhållande til MEL" : "Kristoffers Landslag, innehållsligt ändrade flockar i förhållande til MEL",
				"Kristoffers Landslag" : "Kristoffers Landslag",
				"Kristoffers Landslag, flockar direkt hämtade från MEL" : "Kristoffers Landslag, flockar direkt hämtade från MEL",
				"Kristoffers Landslag, nyskrivna flockar i förhållande till MEL" : "Kristoffers Landslag, nyskrivna flockar i förhållande till MEL"
			},
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-yngrereligiosprosa"] = {
	id : "fsv-yngrereligiosprosa",
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
				"Sankta Anna, enligt Codex Benz 9",
				"Legenden om Blasius (1b) ur Ups C 528",
				"Esthers bok, ur Codex Holm A1",
				"Gregorius av Armenien B, ur Codex Holm A 49 Nådendals klosterbok",
				"Legenden om Sankt Germanus och Genoveva, ur Codex Holm A 49 Nådendals klosterbok",
				"Legenden om Sankt Sigfrid, ur Codex Bilstenianus",
				"S.Johannis Theologi uppenbarelse",
				"Legenden om Sankta Elisabet av Ungern",
				"Birgittas uppenbarelser, åttonde boken, ur Cod Holm A 44",
				"Legenden om Sankt Joakim, ur Codex Holm A 3",
				"Ruths bok, enligt Holm A 1",
				"Den heliga Birgittas liv, Vita abbreviata ur Holm A 33",
				"Själens tröst, ur Codex Holm A 108",
				"Birgittas uppenbarelser Bok 1-3, ur Codex Holm A 33",
				"Legenden om Sankta Tekla, ur Linköpingslegendariet, Benz 39",
				"Om Erik den helige, efter Codex Vat Reg Lat 525",
				"Legenden om Stephanus påve, ur Linköpingslegendariet, Benz 39, översatt av Herr Jöns Ewangelista",
				"Apostla gernigar, ur Codex Oxenstiernianus",
				"Legender om Germanus (2), ur Codex Holm A 49 Nådendals klosterbok",
				"Utdrag ur Legenden om St Mektild, ur Lund Mh 20",
				"Legenden om Sankt Servacius",
				"Lucidarius, redaktion B, ur Holm A 58, Jöns Buddes bok",
				"Svenska Medeltidspostillor 5, enligt Linc T 181",
				"Legenden om Sankta Felicula och Petronella, ur Linköpingslegendariet, Benz 39'",
				"Legenden om Sankta Rakel,, ur Linköpingslegendariet, Benz 39",
				"Legenden om Katarina av Egypten, ur Codex Holm A 3",
				"Svenska Medeltidspostillor 2, enligt Lund Mh 51 och HUB",
				"Legenden om Sankt Alexius ur Linköpingslegendariet",
				"Birgittas uppenbarelser, Sju stycken, fordom i Codex Bergmannius, Lund Mh 20",
				"Sancit Marci Euangelium",
				"Sancti Joannisoppenbarilse",
				"Gregorius Stylista, eller Gregorius på stenen, ur Linköpingslegendariet, Benz 39",
				"Själens kloster,översatt av Jöns Budde",
				"Legenden om Sankta Otilia, ur Linköpingslegendariet, Benz 39",
				"Vår herres födelse, ur Codex Holm A 3",
				"Bonaventura, kapitel 6",
				"Exodus 16, ur Holm A3",
				"S Stephani saga,, ur Linköpingslegendariet, Benz 39, översatt av Johannes Mathei",
				"Legenden om Sankta Jakelina, ur Linköpingslegendariet, Benz 39",
				"Järteckensboken, ur Codex Oxenstiernianus",
				"Gregorius av Armenien A, ur Codex Bergmannius, Lund Mh 20",
				"Legender om Briccius",
				"Legenden om Sankt Macarius Romanus",
				"Legenden om Sankta Amalberga",
				"Legenden om Sankta Maria (F)",
				"Sankt Ansgarii leverne av Rimbertus, ur Codex Holm A 49 Nådendals klosterbok'",
				"Den heliga Elisabet av Ungerns uppenbarelser A",
				"Bonaventuras betraktelser, Kapitel 7 ur Holm A 3",
				"Bonaventuras betraktelser, Codex Bergmannius, Lund Mh 20",
				"Jesu lidandes bägare och hans blods utgjutelse",
				"Legenden om Germanus (1b), ur Codex Bildstenianus Ups C 528",
				"Legenden om Sankta Elisabet av Brabant, ur Linköpingslegendariet, Benz 39",
				"Heliga Birgittas uppenbarelser ur Codex Oxenstiernianus",
				"Nicodemi evangelium enligt Codex Oxenstiernianus",
				"Ängelens diktamen, ur Codex Oxenstiernianus",
				"SanctBartholomei moder, eller Kvinnan utan händer, ur Linköpingslegendariet, översatt av Karl Benedictsson",
				"Codex Bildstenianus; strödda legender Hand I",
				"Legenden om Sankt Paulus omvändelse, ur Codex Bildstenianus",
				"Judits bok, ur Codex Holm A 1",
				"Legenden om Sankt Albinus",
				"Birgittas uppenbarelser, Birgittinernorska efter Skokloster 5 kvart",
				"Legenden om Erik den helige, ur Codex Bildstenianus Ups C 528",
				"Legenden om Sankta Joleida, ur Linköpingslegendariet, Benz 39",
				"Birgittas uppenbarelser, återöversättingen, andra redaktionen, Bok 4-8",
				"Legenden om Sankta Macra, ur Nådendals klosterbok",
				"Legenden om Johannes Chrysostomus, ur Linköpingslegendariet, Benz 39",
				"Legenden om Sankta Maria (E), ur Codex Holm A 3",
				"Legenden om Maria ov Oegnies",
				"Elisabet av Ungerns uppenbarelser B",
				"Legender om Genoveva, ur Codex Holm A 49 Nådendals klosterbok",
				"Legenden om Olav den helige, ur Codex Bildstenianus",
				"Stimulus Amoris, efter Cod Holm A 9",
				"Sjusovaresagan,, ur Linköpingslegendariet, Benz 39",
				"Katarina av Sverige, ur Codex Holm A 58, Jöns Buddes bok",
				"Svenska Medeltidspostillor 1, enligt AM 787",
				"Patrikssagan, efter Codex Bildstenianus (Ups C 528)",
				"Legeneden om Magnus Jarl av Okenöarna",
				"Sagan om den helige Blasius, ur Codex Oxenstiernianus",
				"Vitæpatrum - Helga manna lefverne, ur Codex Oxenstiernianus",
				"Birgittas uppenbarelser, återöversättningen, första redaktionen, Bok 7",
				"Sancta Clara, ur Codex Oxenstiernianus",
				"Heliga Barbara, ur Codex Oxenstiernianus",
				"Legenden om Paulus och Johannes, ur Codex Bildstenianus, hand IV",
				"Regula Salvatoris och Revelationes Extravagantes, ur Berlin KB 3762",
				"Sankt Emerentia och Sankt Anna; översatt från tyska av Lars Elfsson ur Linköpingslegendariet, Benz 39",
				"Karl Magnus, enl Cod Holm D 4",
				"Legenden om Sankta Phara, ur Linköpingslegendariet, Benz 39",
				"Legenden om tre konungar, ur Ups C 528",
				"Bonaventuras betraktelser, kapitel 63 ur Holm A 3",
				"Johannes döparens födelse ur Codex Bildstenianus Ups C 528"
			],
		},
		text_date : {label : "date"}
	}
};

settings.corpora["fsv-yngretankebocker"] = {
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
				"Läkebok 3, ur codex Huss",
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
	attributes : {},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : {
				"Gustav Vasas Bibel, Markusevanguliet" : "Gustav Vasas Bibel, Markusevanguliet",
				"Gustav Vasas Bibel, Lukasevangeliet" : "Gustav Vasas Bibel, Lukasevangeliet"
			},
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
	attributes : {},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : {
				"Dalin: Then Swänska Argus" : "Dalin: Then Swänska Argus"
			},
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
	attributes : {},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : {
				"Peder Swarts krönika" : "Peder Swarts krönika",
				"Olaus Petris Krönika, stil A" : "Olaus Petris Krönika, stil A",
				"Per Brahes krönika" : "Per Brahes krönika",
				"Olaus Petris Krönika, stil B" : "Olaus Petris Krönika, stil B",
				"Olaus Petris Krönika" : "Olaus Petris Krönika"
			},
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
	attributes : {},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : {
				"Runius: Prosastycken" : "Runius: Prosastycken",
				"Mag. Joh. Qvirfelds himmelska örtegårds-sällskap" : "Mag. Joh. Qvirfelds himmelska örtegårds-sällskap",
				"Gyllenborg: Svenska sprätthöken" : "Gyllenborg: Svenska sprätthöken",
				"Jon Stålhammars brev" : "Jon Stålhammars brev",
				"Agneta Horns levnadsbeskrivning" : "Agneta Horns levnadsbeskrivning",
				"Beskrifning öfwer Sweriges Lapmarker 1747 av Pehr Högström, kap 1-4" : "Beskrifning öfwer Sweriges Lapmarker 1747 av Pehr Högström, kap 1-4",
				"AnnaVasas brev" : "AnnaVasas brev",
				"Carl Carlsson Gyllenhielms anteckningar" : "Carl Carlsson Gyllenhielms anteckningar",
				"Samuel Columbus: Mål-roo eller Roo-mål" : "Samuel Columbus: Mål-roo eller Roo-mål",
				"Haqvin Spegel: Dagbok" : "Haqvin Spegel: Dagbok",
				"UrbanHiärne: Stratonice" : "UrbanHiärne: Stratonice"
			},
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
	attributes : {},
	struct_attributes : {
		text_title : {
			label : "title",
			displayType : "select",
			localize : false,
			dataset : {
				"Missgiernings Balk" : "Missgiernings Balk",
				"Giftermåls balk \\(1734\\)" : "Giftermåls balk (1734)"
			},
		},
		text_date : {label : "date"}
	}
};

settings.corpusListing = new CorpusListing(settings.corpora);

