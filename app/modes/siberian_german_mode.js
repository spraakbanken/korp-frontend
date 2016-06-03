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
    id: "siberiangermandialogs",
    title: "Sibirientyska",
    description: "Sibirientyska är nedtecknad talad tyska som talas idag av c:a 36 000 människor i regionen Krasnojarsk i Sibirien (Ryssland). Korpusen har c:a 34 000 ord. Ryska ord och alla verbformer har annoterats (ryska ord och hybrider står i parentes; böjda verbformer får attribut FINIT eller INFINIT). Sibirientyska ingår i ett <a href=\"http://sprak.gu.se/kontakta-oss/larare/andersen-christiane/syntax-in-contact/\" target=\"_blank\">samarbetsprojekt</a> mellan Göteborgs universitet och Astafjev universitet i Krasnojarsk.<br><br><b>Siberian German Corpus</b><br>Siberian German is transcribed German spoken of about 36 000 people in the region of Krasnoyarsk in Siberia (Russia). The corpus consists of about 34 000 words. Russian words and all verb forms are annotated (Russian words and hybrids are given in brackets; verb forms have the attribute FINIT or INFINIT). The SGC has been achieved in <a href=\"http://sprak.gu.se/kontakta-oss/larare/andersen-christiane/syntax-in-contact/\" target=\"_blank\">cooperation</a> with the Astafyev University in Krasnoyarsk.",
    languages: {
        siberiangermandialogs: "svenska"
    },
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {
        sib_de_msd: {
            label: "msd",
            displayType: "select",
            dataset: [
                "INFINIT",
                "INF",
                "FINIT"
            ]
        }
    },
    struct_attributes: {},
};

settings.corpora.siberiangermanwomen = {
    id: "siberiangermanwomen",
    title: "Sibirientyska kvinnor",
    description: "Korpusen består av samtal med fyra kvinnor födda mellan 1927 och 1937 i sovjetiska Volgarepubliken. Deras modersmål är en tysk varietet som har talats i Ryssland sedan andra halvan av 1700-talet. Kvinnorna lever sedan Andra världskrigets slut i regionen Krasnojarsk. De berättar om sina liv och sin nuvarande vardag i deras byar. Korpusen har c:a 16 000 ord. Ryska ord och alla verbformer har annoterats. Ryska ord och hybrider står i [parentes], intervjuers tal står i {parentes}; böjda verbformer får attribut FINIT eller INFINIT. Mer information om forskningsprojektet se <a href=\"http://sprak.gu.se/kontakta-oss/larare/andersen-christiane/syntax-in-contact/\" target=\"_blank\">Syntax i kontakt</a>.<br><br><b>Siberian German women</b><br>The corpus consists of dialogs between four women born in 1927 to 1937 in the Soviet Volga Republic. Their mother tongue is a German variety spoken in Russia since the second half of the 18th century. Since the end of the Second World War, the women have lived in the region of Krasnoyarsk. They talk about their backgrounds and their everyday lives in the village. The corpus consists of about 16 000 words. Russian words and hybrids are given in [brackets], the turns of the interviewers are in {brackets}; all verb forms have got the attribute FINIT or INFINIT. More information on the research project see <a href=\"http://sprak.gu.se/kontakta-oss/larare/andersen-christiane/syntax-in-contact/\" target=\"_blank\">Syntax in contact</a>.",
    languages: {
        siberiangermandialogs: "svenska"
    },
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {
        sib_de_msd: {
            label: "msd",
            displayType: "select",
            dataset: [
                "INFINIT",
                "FINIT"
            ]
        }
    },
    struct_attributes: {},
};

settings.corpusListing = new CorpusListing(settings.corpora);
