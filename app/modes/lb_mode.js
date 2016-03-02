
settings.primaryColor = "#eecccc";
settings.primaryLight = "#eee2e2";
settings.autocomplete = true;
settings.lemgramSelect = true;
settings.wordpicture = true;

settings.corpora = {};
settings.corporafolders = {};
settings.corpora.lb = {
    id : "lb",
    title : "Litteraturbanken",
    description : 'Samtliga etexter och sökbara faksimiler från <a href="http://litteraturbanken.se/">Litteraturbanken.se</a>.',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : {
        pos : attrs.pos,
        msd : attrs.msd,
        baseform : attrs.baseform,
        lex : attrs.lemgram,
        saldo : attrs.saldo,
        dephead : attrs.dephead,
        deprel : attrs.deprel,
        ref : attrs.ref,
        prefix : attrs.prefix,
        suffix : attrs.suffix
    },
    struct_attributes : {
        "text_title" : {label : "title"},
        "text_author" : {label : "author", displayType: "select", dataset: ["Adlerbeth, Gudmund Jöran", "Agrell, Alfhild", "Almqvist, C.J.L.", "Andersson, Dan", "Andræ,Tor", "Angered Strandberg, Hilma", "Anonym", "Armfelt, Gustaf Mauritz", "Atterbom, P.D.A.", "Bellman, Carl Michael", "Benedictsson, Victoria", "Benzon, Karl", "Berg, Per Gustaf", "Berger, Henning", "Bergman, Hjalmar", "Birgitta", "Blanche, August", "Bondeson, August", "Bore, Erik", "Botin, Anders", "Boye, Karin", "Brelin,Salomon", "Bremer, Fredrika", "Brenner, Sophia Elisabeth", "Bååth, Albert Ulrik", "Bååth-Holmberg, Cecilia", "Böttiger, Carl Wilhelm", "Cajander, Zacharias", "Cederborgh, Fredrik", "Celsius, Olof", "Columbus, Samuel", "Crusenstolpe, Magnus Jacob", "Dagerman, Stig", "Dahlgren, Carl Fredric", "Dahlgren, Fredrik August", "Dahlstierna, Gunno", "Dalin, Olof von", "Duse, Samuel August", "Edelcrantz, Abraham Niclas", "Edelfeldt, Inger", "Ehrensvärd, Carl August", "Ekelund, Vilhelm", "Elkan, Sophie", "Enbom, Per Ulrik", "Englund, Peter", "Engström, Albert", "Fersen, Axel von", "Fitinghoff, Laura", "Fleming, Claes Adolph", "Flygare-Carlén, Emilie", "Franzén, Frans Michael", "Fredenheim, Carl Fredrik", "Fröding, Gustaf", "Geijer, Erik Gustaf", "Geijerstam, Gustaf af", "Gjörwell, Carl Christoffer", "Granberg, Per Adolf", "Grubbe, Samuel", "Gustaf III", "Gyllenborg, Gustaf Fredrik", "Hamilton, Adolf Ludvig", "Hansson, Ola", "Hasselskog, Nils", "Hebbe, Wendela", "Heidenstam, Verner von", "Hermansson, Matthias von", "Horn, Agneta", "Höijer, Benjamin", "Höpken, Anders Johan von", "Johansson, Lars (Lucidor)", "Jonsson, Inge", "Josephson, Ernst", "Karlfeldt, Erik Axel", "Kellgren, Johan Henrik", "Key, Ellen", "Knorring, Sophie von", "Koch, Martin", "Kræmer, Anders Robert von", "Kyrklund, Willy", "Kämpe, Alfred", "Lagerlöf, Selma", "Larsson, Stig", "Leffler, Anne Charlotte", "Lenngren, Anna Maria", "Leopold, Carl Gustaf af", "Levertin, Oscar", "Lidner, Bengt", "Lindegren, Erik", "Linder, Nils", "Lindholm, Fredrik", "Lindqvist, Sven", "Livijn, Clas", "Ljunggren, Gustaf", "Ljungstedt, Aurora", "Lo-Johansson, Ivar", "Lundegård, Axel", "Martinson, Harry", "Mellin, Gustaf Henrik", "Molin, Lars", "Murberg, Johan", "Månsson, Fabian", "Møller Jensen, Elisabeth", "Nerman, Gustaf", "Nordenflycht, Hedvig Charlotta", "Nordenskiöld, Adolf Erik", "Nordin, Carl", "Nyblom, Helena", "Oxenstierna, Johan Gabriel", "Palm, August", "Palmblad, Vilhelm Fredrik", "Parland, Henry", "Personne, Johan Wilhelm", "Petrus de Dacia", "Platen, Henrica Carolina von", "Regis, Julius", "Regnér, Gustaf", "Roos, Mathilda", "Rosenstein, Nils von", "Rudbeck, Olof, den yngste", "Runeberg, Fredrika Charlotta", "Runeberg, Johan Ludvig", "Runius, Johan", "Rydberg, Carl August", "Rydberg, Viktor", "Sandel, Maria", "Schröderheim, Elis", "Schwartz, Marie Sophie", "Schwerin d. y., Martina von", "Sehlstedt, Elias", "Silfverstolpe, Malla", "Sjöberg, Birger", "Sjöberg, Erik", "Sjöberg, Nils Lorents", "Skogekär Bergbo", "Snellman, Johan Vilhelm", "Snoilsky, Carl", "Spegel, Haquin", "Sprengtporten, Jakob Magnus", "Stagnelius, Erik Johan", "Stiernhielm, Georg", "Strindberg, August", "Stålberg, Wilhelmina", "Sundman, Per Olof", "Sätherberg, Herman", "Söderberg, Hjalmar", "Söderblom, Nathan", "Södergran, Edith", "Tankebyggarorden", "Tavaststjerna, Karl August", "Tegnér, Esaias", "Thorild, Thomas", "Törneros, Adolph", "Utile Dulci", "Wahlenberg, Anna", "Wahlström, Pehr", "Wallenberg, Jacob", "Wallengren, Axel", "Wallin, Johan Olof", "Wallmark, Peter Adam", "Wecksell, Josef Julius", "Werving, Johan Gabriel", "Wingård, Johan", "Wästberg, Per", "Wågman, Frans Oskar", "Ödmann, Jenny Maria"],
            localize : false,
            extended_template : selectType.extended_template,
            controller : selectType.controller
        },
        "text_url" : {label : "verk", type : "url"},
        "text_source" : {label : "source"},
        "text_date" : {label : "imprintyear"},
        "page_n" : {label : "page"},
        "page_url" : {label : "pagelink", type : "url"}
    }
};

settings.corpusListing = new CorpusListing(settings.corpora);
