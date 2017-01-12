settings.primaryColor = "#F7D1E4";
settings.primaryLight = "#FFEBF5";
settings.autocomplete = false;
settings.wordpicture = false;

settings.struct_attribute_selector = "intersection"
settings.word_attribute_selector   = "intersection"
settings.reduce_word_attribute_selector = "intersection"

settings.corpora = {};
settings.corporafolders = {};

settings.corporafolders.sweac = {
    title: "Akademiska texter",
    contents: ["sweachum", "sweacsam"]
};

settings.corporafolders.strindberg = {
        title: "August Strindberg",
        contents: ["strindbergromaner", "strindbergbrev"]
};

settings.corporafolders.fisk = {
    title: "Finlandssvenska texter",
    contents: [],
    description: "Det första steget för att skapa en finlandssvensk korpus togs redan " +
            "på 1990-talet (Institutionen för nordiska språk vid Helsingfors universitet) " +
            "och under åren 1999–2000 fortsatte arbetet (ett samarbetsprojekt mellan " +
            "Institutet för de inhemska språken, Institutionen för allmän språkvetenskap " +
            "och CSC (IT Center for Science)). Under åren 2011–2013 byggs den finlandssvenska " +
            "korpusen ut som ett samarbetsprojekt mellan Svenska litteratursällskapet i Finland, " +
            "Institutet för de inhemska språken och Göteborgs universitet."
};

settings.corporafolders.fisk.webtexts = {
    title: "Webbtexter",
    contents: ["fsbbloggvuxna", "magmakolumner"]
};

settings.corporafolders.fisk.governmental = {
    title: "Myndighetstexter",
    contents: ["informationstidningar", "lagtexter", "myndighet", "propositioner"]
};

settings.corporafolders.fisk.literature = {
    title: "Skön- och facklitteratur",
    contents: ["barnlitteratur", "fsbessaistik", "fsbsakprosa", "fsbskonlit1960-1999", "fsbskonlit2000tal", "ungdomslitteratur"]
};

settings.corporafolders.fisk.newspapertexts = {
    title: "Tidningstexter",
    contents: ["borgabladet", "vastranyland", "at2012", "ostranyland"]
};

settings.corporafolders.fisk.newspapertexts.fnb = {
    title: "FNB",
    contents: ["fnb1999", "fnb2000"],
    description: "<a href=\"http://www.stt.fi/sv\" target=\"_blank\">FNB</a> är Finlands ledande nyhets- och bildbyrå."
};

settings.corporafolders.fisk.newspapertexts.hbl = {
    title: "Hufvudstadsbladet",
    contents: ["hbl1991", "hbl1998", "hbl1999", "hbl20122013", "hbl2014"],
    description: "<a href=\"http://www.hbl.fi\" target=\"_blank\">Hufvudstadsbladet</a> är den största finlandssvenska dagstidningen i Finland."
};

settings.corporafolders.fisk.newspapertexts.jakobstadstidning = {
    title: "Jakobstads tidning",
    contents: ["jakobstadstidning1999", "jakobstadstidning2000"],
    description: "Jakobstads Tidning var en lokal dagstidning i Österbotten som gavs ut under perioden 1898–2008."
};

settings.corporafolders.fisk.newspapertexts.pargaskungorelser = {
    title: "Pargas kungörelser",
    contents: ["pargaskungorelser2011", "pargaskungorelser2012"],
    description: "<a href=\"http://www.pku.fi\" target=\"_blank\">Pargas Kungörelser</a> är en regional tvåspråkig (svenska och finska) tidning med spridning i Pargas med omnejd. I korpusen är endast den svenskspråkiga delen av tidningen med."
};

settings.corporafolders.fisk.newspapertexts.sydosterbotten = {
    title: "Syd-Österbotten",
    contents: ["sydosterbotten2010", "sydosterbotten2011", "sydosterbotten2012", "sydosterbotten2013", "sydosterbotten2014"],
    description: "<a href=\"http://www.sydin.fi\" target=\"_blank\">Syd-Österbotten</a> är en regional svenskspråkig dagstidning i Österbotten."
};

settings.corporafolders.fisk.newspapertexts.vasab = {
    title: "Vasabladet",
    contents: ["vasabladet1991", "vasabladet2012", "vasabladet2013", "vasabladet2014"],
    description: "<a href=\"http://www.vasabladet.fi\" target=\"_blank\">Vasabladet</a> är en regional svenskspråkig dagstidning i Österbotten."
};

settings.corporafolders.fisk.newspapertexts.abounderrattelser = {
    title: "Åbo Underrättelser",
    contents: ["abounderrattelser2012", "abounderrattelser2013"],
    description: "<a href=\"www.abounderrattelser.fi\" target=\"_blank\">Åbo Underrättelser</a> är en regional svenskspråkig dagstidning i Åbotrakten."
};

settings.corporafolders.fisk.newspapertexts.osterbottenstidning = {
    title: "Österbottens Tidning",
    contents: ["osterbottenstidning2011", "osterbottenstidning2012", "osterbottenstidning2013", "osterbottenstidning2014"],
    description: "<a href=\"http://www.ot.fi\" target=\"_blank\">Österbottens Tidning</a> är en regional svenskspråkig tidning i Österbotten."
    //
};

settings.corporafolders.fisk.magazines = {
    title: "Tidskrifter",
    contents: ["astra1960-1979", "astranova", "bullen", "fanbararen", "finsktidskrift", "forumfeot", "hankeiten", "hanken", "jft", "kallan", "meddelanden", "nyaargus", "studentbladet", "svenskbygden"]
};

settings.corporafolders.medical = {
    title: "Medicinska texter",
    contents: ["diabetolog", "smittskydd"]
};

settings.corporafolders.medical.ltd = {
    title: "Läkartidningen",
    contents: ["lt1996", "lt1997", "lt1998", "lt1999", "lt2000", "lt2001", "lt2002", "lt2003", "lt2004", "lt2005"]
};

settings.corporafolders.myndighet = {
    title : "Myndighetstexter",
    contents : ["fsbmyndighet1800tal"],
    description : ""
};

settings.corporafolders.protected = {
    title: "Skyddade korpusar",
    contents: ["ansokningar", "sprakfragor", "coctaill", "forhor", "gdc", "mepac", "soexempel", "sw1203", "tisus", "ivip"]
};

settings.corporafolders.novels = {
    title: "Skönlitteratur",
    contents: ["aspacsv", "romi", "romii", "rom99", "storsuc", "romg"]
};

settings.corporafolders.socialmedia = {
    title: "Sociala medier",
    contents: []
};

settings.corporafolders.socialmedia.bloggmix = {
    title: "Bloggmix",
    contents: ["bloggmix1998", "bloggmix1999", "bloggmix2000", "bloggmix2001", "bloggmix2002", "bloggmix2003", "bloggmix2004", "bloggmix2005", "bloggmix2006", "bloggmix2007", "bloggmix2008", "bloggmix2009", "bloggmix2010", "bloggmix2011", "bloggmix2012", "bloggmix2013", "bloggmix2014", "bloggmix2015", "bloggmixodat"],
    description: "Material från ett urval av svenska bloggar. Uppdateras regelbundet."
};

settings.corporafolders.socialmedia.forum = {
    title: "Diskussionsforum",
    contents: []
};

settings.corporafolders.socialmedia.forum.familjeliv = {
    title: "Familjeliv",
    contents: ["familjeliv-adoption", "familjeliv-allmanna-ekonomi", "familjeliv-allmanna-familjeliv", "familjeliv-allmanna-fritid", "familjeliv-allmanna-hushem", "familjeliv-allmanna-husdjur", "familjeliv-allmanna-kropp", "familjeliv-allmanna-noje", "familjeliv-allmanna-samhalle", "familjeliv-allmanna-sandladan", "familjeliv-expert", "familjeliv-foralder", "familjeliv-gravid", "familjeliv-kansliga", "familjeliv-medlem-allmanna", "familjeliv-medlem-foraldrar", "familjeliv-medlem-planerarbarn", "familjeliv-medlem-vantarbarn", "familjeliv-pappagrupp", "familjeliv-planerarbarn", "familjeliv-sexsamlevnad", "familjeliv-svartattfabarn", "familjeliv-anglarum"],
    description: "Material från diskussionsforumet <a target=\"_blank\" href=\"https://www.familjeliv.se/\">Familjeliv</a>. Materialet är under uppbyggnad."
};

settings.corporafolders.socialmedia.forum.flashback = {
    title: "Flashback",
    contents: ["flashback-dator", "flashback-droger", "flashback-fordon", "flashback-hem", "flashback-kultur", "flashback-livsstil", "flashback-mat", "flashback-politik", "flashback-resor", "flashback-samhalle", "flashback-sex", "flashback-sport", "flashback-vetenskap", "flashback-ovrigt", "flashback-flashback"],
    description: "Material från diskussionsforumet <a target=\"_blank\" href=\"https://www.flashback.org/\">Flashback</a>."
};

settings.corporafolders.socialmedia.twitter = {
    title: "Twitter",
    contents: ["twitter", "twitter-pldebatt-130612", "twitter-pldebatt-131006", "twitter-pldebatt-140504"]
};

settings.corporafolders.newspapertexts = {
    title: "Tidningstexter",
    contents: ["attasidor", "dn1987", "ordat"]
};

settings.corporafolders.newspapertexts.gp = {
    title: "GP",
    contents: ["gp1994", "gp2001", "gp2002", "gp2003", "gp2004", "gp2005", "gp2006", "gp2007", "gp2008", "gp2009", "gp2010", "gp2011", "gp2012", "gp2013", "gp2d"]
};

settings.corporafolders.newspapertexts.press = {
    title: "Press",
    contents: ["press65", "press76", "press95", "press96", "press97", "press98"]
};

settings.corporafolders.newspapertexts.webnews = {
    title: "Webbnyheter",
    contents: ["webbnyheter2001", "webbnyheter2002", "webbnyheter2003", "webbnyheter2004", "webbnyheter2005", "webbnyheter2006", "webbnyheter2007", "webbnyheter2008", "webbnyheter2009", "webbnyheter2010", "webbnyheter2011", "webbnyheter2012", "webbnyheter2013"]
};

settings.corporafolders.magazines = {
    title: "Tidskrifter",
    contents: ["fof"]
};

settings.corporafolders.governmental = {
    title: "Myndighetstexter",
    contents: ["klarsprak", "sou", "sfs"]
};




/*
 * CORPORA
 */

settings.corpora.magmakolumner = {
    id: "magmakolumner",
    title: "Magma kolumner 2009–2012",
    description: "Material ur kolumner publicerade av <a target=\"_blank\" href=\"http://www.magma.fi\">Tankesmedjan Magma</a>",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "date"}
    }
};

settings.corpora.fsbbloggvuxna = {
    id: "fsbbloggvuxna",
    title: "Bloggtexter 2006–2013",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        blog_title: {label: "blog_title"},
        blog_url: {label: "blog_url", type: "url"},
        blog_age: {label: "author_age"},
        blog_city: {label: "city"},
        text_title: {label: "post_title"},
        text_date: {label: "date"},
        text_tags: {label: "tags", type: "set"},
        text_url: {label: "post_url", type: "url"}
    }
};

settings.corpora["fsbskonlit1960-1999"] = {
    id: "fsbskonlit1960-1999",
    title: "Skönlitteratur 1960–1999",
    description: "Material ur skönlitterära verk publicerade under 1960–1999.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "year"},
        text_publisher: {label: "publisher"}
    }
};

settings.corpora.fsbskonlit2000tal = {
    id: "fsbskonlit2000tal",
    title: "Skönlitteratur 2000–2013",
    description: "Material ur skönlitterära verk publicerade under 2000–2013.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "year"},
        text_publisher: {label: "publisher"}
    }
};

settings.corpora.barnlitteratur = {
    id: "barnlitteratur",
    title: "Barnlitteratur 1988–2013",
    description: "Material ur barnlitterära verk publicerade under 2000–2013.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "year"},
        text_publisher: {label: "publisher"}
    }
};

settings.corpora.fsbessaistik = {
    id: "fsbessaistik",
    title: "Essäistisk litteratur 1963–2010",
    description: "Material ur essäistiska verk publicerade under 1992–2013",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "year"},
        text_publisher: {label: "publisher"}
    }
};

settings.corpora.fsbsakprosa = {
    id: "fsbsakprosa",
    title: "Sakprosa 2006–2013",
    description: "Material ur facklitterära verk publicerade under 2006–2013.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "year"},
        text_publisher: {label: "publisher"}
    }
};

settings.corpora.ungdomslitteratur = {
    id: "ungdomslitteratur",
    title: "Ungdomslitteratur 1992–2011",
    description: "Material ur ungdomslitterära verk publicerade under 1992–2013.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "year"},
        text_publisher: {label: "publisher"}
    }
};

settings.corpora.informationstidningar = {
    id: "informationstidningar",
    title: "Kommuners och städers informationstidningar 2001–2013",
    description: "Material ur informationstidningar som ges ut av kommuner och städer.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lagtexter = {
    id: "lagtexter",
    title: "Lagtexter 1990–2000",
    description: "Material ur Finlands lag.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
    }
};

settings.corpora.myndighet = {
    id: "myndighet",
    title: "Myndighetsprosa 1990–2013",
    description: "Material ur bland annat Utbildningsstyrelsens, Undervisningsministeriets och Länsstyrelsens publikationer.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_publisher: {label: "publisher"},
        text_title: {label: "title"}
    }
};

settings.corpora.propositioner = {
    id: "propositioner",
    title: "Propositioner 1993–2013",
    description: 'Material ur <a target="_blank" href="http://www.eduskunta.fi/triphome/bin/vexhaku.sh?lyh=HE?kieli=ru">regeringens propositioner</a>.',
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_title: {label: "title"}
    }
};

settings.corpora.finsktidskrift = {
    id: "finsktidskrift",
    title: "Finsk tidskrift 2011–2012",
    description: "<a target=\"_blank\" href=\"http://www.abo.fi/public/finsktidskrift\">Finsk Tidskrift</a> är en tidskrift som strävar efter ingående reflektion inom ett brett område och vill ge djupare historisk, politisk och kulturell förståelse av den aktuella samtidsdebatten.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.forumfeot = {
    id: "forumfeot",
    title: "Forum för ekonomi och teknik 2008–2012",
    description: "<a target=\"_blank\" href=\"http://www.forummag.fi\">Forum för ekonomi och teknik</a> är Finlands enda svenskspråkiga affärsmagasin och ger sina läsare information om näringsliv, ledarskap och teknologi.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.hanken = {
    id: "hanken",
    title: "Hanken 2008–2011",
    description: "Tidningen <a target=\"_blank\" href=\"http://www.hanken.fi/public/alumntidning\">Hanken</a> är Svenska handelshögskolans alumntidning.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.svenskbygden = {
    id: "svenskbygden",
    title: "Svenskbygden 2010–2011",
    description: "<a target=\"_blank\" href=\"http://www.sfv.fi/publikationer/svenskbygden/\">Svenskbygden</a> är Svenska Folkskolans Vänners medlemstidning. Tiskriften innehåller artiklar som berör allt från utbildning och aktuella samhällsfrågor till kultur och litteratur.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_year: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.studentbladet = {
    id: "studentbladet",
    title: "Studentbladet 2011",
    description: "<a target=\"_blank\" href=\"http://www.stbl.fi\">Studentbladet</a> är en tidskrift som bevakar samtliga svenskspråkiga studieorter på fastlandet i Finland.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.jakobstadstidning1999 = {
    id: "jakobstadstidning1999",
    title: "Jakobstads tidning 1999",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.jakobstadstidning2000 = {
    id: "jakobstadstidning2000",
    title: "Jakobstads tidning 2000",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.sweachum = {
    id: "sweachum",
    title: "Humaniora",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_type: {label: "type",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "Licentiat": "Licentiat",
                "PhD": "PhD"
            }
        },
        text_subject: {label: "subject",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "Etnologi": "Etnologi",
                "Filosofi": "Filosofi",
                "Historia": "Historia",
                "Jämförande språkvetenskap och lingvistik": "Jämförande språkvetenskap och lingvistik",
                "Konst": "Konst",
                "Litteraturvetenskap": "Litteraturvetenskap",
                "Religionsvetenskap": "Religionsvetenskap"
            }
        }
    }
};

settings.corpora.sweacsam = {
    id: "sweacsam",
    title: "Samhällsvetenskap",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_type: {label: "type",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "Licentiat": "Licentiat",
                "PhD": "PhD"
            }
        },
        text_subject: {label: "subject",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "Ekonomi och näringsliv": "Ekonomi och näringsliv",
                "Juridik": "Juridik",
                "Medie- och kommunikationsvetenskap": "Medie- och kommunikationsvetenskap",
                "Psykologi": "Psykologi",
                "Social och ekonomisk geografi": "Social och ekonomisk geografi",
                "Sociologi": "Sociologi",
                "Statsvetenskap": "Statsvetenskap",
                "Utbildningsvetenskap": "Utbildningsvetenskap"
            }
        }
    }
};

settings.corpora.attasidor = {
    id: "attasidor",
    title: "8 SIDOR",
    description: "<a target=\"_blank\" href=\"http://www.8sidor.se/\">8 SIDOR</a> är en lättläst nyhetstidning.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"}
    }
};

settings.corpora.dn1987 = {
    id: "dn1987",
    title: "DN 1987",
    description: "Dagens Nyheter 1987.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.webbnyheter2001 = {
    id: "webbnyheter2001",
    title: "Webbnyheter 2001",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url", type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2002 = {
    id: "webbnyheter2002",
    title: "Webbnyheter 2002",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2003 = {
    id: "webbnyheter2003",
    title: "Webbnyheter 2003",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2004 = {
    id: "webbnyheter2004",
    title: "Webbnyheter 2004",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2005 = {
    id: "webbnyheter2005",
    title: "Webbnyheter 2005",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2006 = {
    id: "webbnyheter2006",
    title: "Webbnyheter 2006",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2007 = {
    id: "webbnyheter2007",
    title: "Webbnyheter 2007",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2008 = {
    id: "webbnyheter2008",
    title: "Webbnyheter 2008",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2009 = {
    id: "webbnyheter2009",
    title: "Webbnyheter 2009",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2010 = {
    id: "webbnyheter2010",
    title: "Webbnyheter 2010",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2011 = {
    id: "webbnyheter2011",
    title: "Webbnyheter 2011",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2012 = {
    id: "webbnyheter2012",
    title: "Webbnyheter 2012",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.webbnyheter2013 = {
    id: "webbnyheter2013",
    title: "Webbnyheter 2013",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_title: {label: "title"},
        text_url: {label: "url" , type: "url"},
        text_newspaper: {label: "newspaper"}
    }
};

settings.corpora.gp1994 = {
    id: "gp1994",
    title: "GP 1994",
    description: "Göteborgs-Posten 1994.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_section: {label: "section"}
    }
};

settings.corpora.gp2001 = {
    id: "gp2001",
    title: "GP 2001",
    description: "Göteborgs-Posten 2001.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.gp2002 = {
    id: "gp2002",
    title: "GP 2002",
    description: "Göteborgs-Posten 2002.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.gp2003 = {
    id: "gp2003",
    title: "GP 2003",
    description: "Göteborgs-Posten 2003.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.gp2004 = {
    id: "gp2004",
    title: "GP 2004",
    description: "Göteborgs-Posten 2004.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.gp2005 = {
    id: "gp2005",
    title: "GP 2005",
    description: "Göteborgs-Posten 2005.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.gp2006 = {
    id: "gp2006",
    title: "GP 2006",
    description: "Göteborgs-Posten 2006.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.gp2007 = {
    id: "gp2007",
    title: "GP 2007",
    description: "Göteborgs-Posten 2007.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.gp2008 = {
    id: "gp2008",
    title: "GP 2008",
    description: "Göteborgs-Posten 2008.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.gp2009 = {
    id: "gp2009",
    title: "GP 2009",
    description: "Göteborgs-Posten 2009.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_author: {label: "article_author"},
        text_section: {label: "article_section"}
    }
};

settings.corpora.gp2010 = {
    id: "gp2010",
    title: "GP 2010",
    description: "Göteborgs-Posten 2010.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_author: {label: "article_author"},
        text_section: {label: "article_section"}
    }
};

settings.corpora.gp2011 = {
    id: "gp2011",
    title: "GP 2011",
    description: "Göteborgs-Posten 2011.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_author: {label: "article_author"},
        text_section: {label: "article_section"}
    }
};

settings.corpora.gp2012 = {
    id: "gp2012",
    title: "GP 2012",
    description: "Göteborgs-Posten 2012.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: {
        text_date: sattrs.date,
        text_author: {label: "article_author"},
        text_section: {label: "article_section"}
    }
};

settings.corpora.gp2013 = {
    id: "gp2013",
    title: "GP 2013",
    description: "Göteborgs-Posten 2013.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: {
        text_date: sattrs.date,
        text_author: {label: "article_author"},
        text_section: {label: "article_section"}
    }
};

settings.corpora.gp2d = {
    id: "gp2d",
    title: "GP – Två dagar",
    description: "Helgbilaga till Göteborgs-Posten.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: {
        text_issue: {label: "issue"}
    }
};

settings.corpora.ordat = {
    id: "ordat",
    title: "ORDAT: Svenska dagbladets årsbok 1923–1958",
    description: "25 årgångar av Svenska Dagbladets årsbok, 1923–45, 1948 och 1958.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "text_year"},
        text_volume: {label: "text_volume"}
    }
};

settings.corpora.fof = {
    id: "fof",
    title: "Forskning & Framsteg",
    description: "Artiklar från tidskriften Forskning & Framsteg, nummer 7, 1992 till och med nummer 8, 1996.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_issue: {label: "issue"}
    }
};

settings.corpora.press65 = {
    id: "press65",
    title: "Press 65",
    description: "Tidningsartiklar från Göteborgs Handels- och Sjöfartstidning, Svenska Dagbladet, Stockholmstidningen, Dagens Nyheter och Sydsvenska Dagbladet.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"},
        text_publisher: {label: "article_publisher"},
        text_topic: {label: "article_topic"},
        text_genre: {label: "article_genre"}
    }
};

settings.corpora.press76 = {
    id: "press76",
    title: "Press 76",
    description: "Tidningsartiklar från Göteborgs Handels- och Sjöfartstidning, Svenska Dagbladet, Stockholmstidningen, Dagens Nyheter och Sydsvenska Dagbladet.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_year: {label: "year"},
        text_publisher: {label: "article_publisher"}
    }
};

settings.corpora.press95 = {
    id: "press95",
    title: "Press 95",
    description: "Tidningsartiklar från Arbetet, Dagens Nyheter, Göteborgs-Posten, Svenska Dagbladet och Sydsvenskan.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: {
        text_date: {label: "date"},
        text_publisher: {label: "article_publisher"},
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.press96 = {
    id: "press96",
    title: "Press 96",
    description: "Tidningsartiklar från Göteborgs-Posten och Svenska Dagbladet.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: {
        text_date: {label: "date"},
        text_publisher: {label: "article_publisher"},
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.press97 = {
    id: "press97",
    title: "Press 97",
    description: "Tidningsartiklar från DN, Göteborgs-Posten och Svenska Dagbladet.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: {
        text_date: {label: "date"},
        text_publisher: {label: "publisher"},
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.press98 = {
    id: "press98",
    title: "Press 98",
    description: "Tidningsartiklar från DN, Göteborgs-Posten och Svenska Dagbladet.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: {
        text_date: {label: "date"},
        text_publisher: {label: "article_publisher"},
        text_sectionshort: {label: "section"}
    }
};

settings.corpora.strindbergbrev = {
    id: "strindbergbrev",
    title: "August Strindbergs brev",
    description: "Samtliga tryckta och otryckta brev som var tillgängliga 1 augusti 1991.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_recipient: {label: "text_recipient"},
        text_year: {label: "year"},
        text_month: {label: "month"},
        text_day: {label: "day"},
        text_volume: {label: "text_volume"}
    }
};

var familjeliv_structs = {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
};

settings.corpora["familjeliv-allmanna-ekonomi"] = {
    id: "familjeliv-allmanna-ekonomi",
    title: "Familjeliv: Allmänna rubriker – Ekonomi & juridik",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-allmanna-familjeliv"] = {
    id: "familjeliv-allmanna-familjeliv",
    title: "Familjeliv: Allmänna rubriker – Familjeliv.se",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-allmanna-hushem"] = {
    id: "familjeliv-allmanna-hushem",
    title: "Familjeliv: Allmänna rubriker – Hus & hem",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-allmanna-husdjur"] = {
    id: "familjeliv-allmanna-husdjur",
    title: "Familjeliv: Allmänna rubriker – Husdjur",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-allmanna-fritid"] = {
    id: "familjeliv-allmanna-fritid",
    title: "Familjeliv: Allmänna rubriker – Fritid & hobby",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-allmanna-kropp"] = {
    id: "familjeliv-allmanna-kropp",
    title: "Familjeliv: Allmänna rubriker – Kropp & själ",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-allmanna-noje"] = {
    id: "familjeliv-allmanna-noje",
    title: "Familjeliv: Allmänna rubriker – Nöje",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-allmanna-samhalle"] = {
    id: "familjeliv-allmanna-samhalle",
    title: "Familjeliv: Allmänna rubriker – Samhälle",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-allmanna-sandladan"] = {
    id: "familjeliv-allmanna-sandladan",
    title: "Familjeliv: Allmänna rubriker – Sandlådan",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-adoption"] = {
    id: "familjeliv-adoption",
    title: "Familjeliv: Adoption",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-expert"] = {
    id: "familjeliv-expert",
    title: "Familjeliv: Fråga experten",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-foralder"] = {
    id: "familjeliv-foralder",
    title: "Familjeliv: Förälder",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-gravid"] = {
    id: "familjeliv-gravid",
    title: "Familjeliv: Gravid",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-kansliga"] = {
    id: "familjeliv-kansliga",
    title: "Familjeliv: Känsliga rummet",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-medlem-allmanna"] = {
    id: "familjeliv-medlem-allmanna",
    title: "Familjeliv: Medlemstrådar – Allmänna",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};


settings.corpora["familjeliv-medlem-foraldrar"] = {
    id: "familjeliv-medlem-foraldrar",
    title: "Familjeliv: Medlemstrådar – Föräldrar",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-medlem-planerarbarn"] = {
    id: "familjeliv-medlem-planerarbarn",
    title: "Familjeliv: Medlemstrådar – Planerar barn",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};


settings.corpora["familjeliv-medlem-vantarbarn"] = {
    id: "familjeliv-medlem-vantarbarn",
    title: "Familjeliv: Medlemstrådar – Väntar barn",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-pappagrupp"] = {
    id: "familjeliv-pappagrupp",
    title: "Familjeliv: Pappagrupp",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-planerarbarn"] = {
    id: "familjeliv-planerarbarn",
    title: "Familjeliv: Planerar barn",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-sexsamlevnad"] = {
    id: "familjeliv-sexsamlevnad",
    title: "Familjeliv: Sex & samlevnad",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-svartattfabarn"] = {
    id: "familjeliv-svartattfabarn",
    title: "Familjeliv: Svårt att få barn",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["familjeliv-anglarum"] = {
    id: "familjeliv-anglarum",
    title: "Familjeliv: Änglarum",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: familjeliv_structs
};

settings.corpora["flashback-dator"] = {
    id: "flashback-dator",
    title: "Flashback: Dator & IT",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-droger"] = {
    id: "flashback-droger",
    title: "Flashback: Droger",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-fordon"] = {
    id: "flashback-fordon",
    title: "Flashback: Fordon & trafik",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-hem"] = {
    id: "flashback-hem",
    title: "Flashback: Hem, bostad & familj",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-kultur"] = {
    id: "flashback-kultur",
    title: "Flashback: Kultur & media",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-livsstil"] = {
    id: "flashback-livsstil",
    title: "Flashback: Livsstil",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-mat"] = {
    id: "flashback-mat",
    title: "Flashback: Mat, dryck & tobak",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-politik"] = {
    id: "flashback-politik",
    title: "Flashback: Politik",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-resor"] = {
    id: "flashback-resor",
    title: "Flashback: Resor",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-samhalle"] = {
    id: "flashback-samhalle",
    title: "Flashback: Samhälle",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-sex"] = {
    id: "flashback-sex",
    title: "Flashback: Sex",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-sport"] = {
    id: "flashback-sport",
    title: "Flashback: Sport & träning",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-vetenskap"] = {
    id: "flashback-vetenskap",
    title: "Flashback: Vetenskap & humaniora",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-ovrigt"] = {
    id: "flashback-ovrigt",
    title: "Flashback: Övrigt",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

settings.corpora["flashback-flashback"] = {
    id: "flashback-flashback",
    title: "Flashback: Om Flashback",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_username: {label: "username2"},
        text_date: {label: "date"},
        text_links: {label: "postlinks", type: "set"},
        text_url: {label: "posturl", type: "url"},
        thread_title: {label: "thread"},
        thread_postcount: {label: "threadpostcount"},
        thread_lastpost: {label: "threadlastpost"},
        thread_url: {label: "thread", type: "url"},
        forum_title: {label: "forum"},
        forum_url: {label: "forum", type: "url"}
    }
};

var bloggmix_structs = {
    blog_title: {label: "blog_title"},
    blog_url: {label: "blog_url", type: "url"},
    blog_age: {label: "author_age"},
    blog_city: {label: "city"},
    blog_categories: {label: "categories", type: "set"},
    text_title: {label: "post_title"},
    text_date: {label: "date"},
    text_tags: {label: "tags", type: "set"},
    text_url: {label: "post_url", type: "url"}
}

settings.corpora.bloggmix1998 = {
    id: "bloggmix1998",
    title: "Bloggmix 1998",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix1999 = {
    id: "bloggmix1999",
    title: "Bloggmix 1999",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2000 = {
    id: "bloggmix2000",
    title: "Bloggmix 2000",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2001 = {
    id: "bloggmix2001",
    title: "Bloggmix 2001",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2002 = {
    id: "bloggmix2002",
    title: "Bloggmix 2002",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2003 = {
    id: "bloggmix2003",
    title: "Bloggmix 2003",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2004 = {
    id: "bloggmix2004",
    title: "Bloggmix 2004",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2005 = {
    id: "bloggmix2005",
    title: "Bloggmix 2005",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2006 = {
    id: "bloggmix2006",
    title: "Bloggmix 2006",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2007 = {
    id: "bloggmix2007",
    title: "Bloggmix 2007",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2008 = {
    id: "bloggmix2008",
    title: "Bloggmix 2008",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2009 = {
    id: "bloggmix2009",
    title: "Bloggmix 2009",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2009 = {
    id: "bloggmix2009",
    title: "Bloggmix 2009",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2010 = {
    id: "bloggmix2010",
    title: "Bloggmix 2010",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2011 = {
    id: "bloggmix2011",
    title: "Bloggmix 2011",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2012 = {
    id: "bloggmix2012",
    title: "Bloggmix 2012",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2013 = {
    id: "bloggmix2013",
    title: "Bloggmix 2013",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2014 = {
    id: "bloggmix2014",
    title: "Bloggmix 2014",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmix2015 = {
    id: "bloggmix2015",
    title: "Bloggmix 2015",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs2,
    struct_attributes: bloggmix_structs
};

settings.corpora.bloggmixodat = {
    id: "bloggmixodat",
    title: "Bloggmix okänt datum",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: bloggmix_structs
};


settings.corpora.drama = {
    id: "drama",
    title: "Dramawebben",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"}
    }
};

settings.corpora["europarl-sv"] = {
    id: "europarl-sv",
    title: "Europarl svenska",
    description: "Texter från Europaparlamentets webbsida.",
    context: settings.defaultContext,
    within: settings.defaultWithin,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"},
        text_speaker: {label: "speaker"}
    }
};

settings.corpora["sprakfragor"] = {
    id: "sprakfragor",
    title: "Besvarade språkfrågor",
    description: 'Spåkrådets rådgivningsmejl<br><br>För åtkomst kontakta <a href="mailto:per-anders.jande@sprakochfolkminnen.se">Per-Anders Jande</a>.',
    limited_access: true,
    context: {
        "1 sentence": "1 sentence",
        "1 text": "1 text"
    },
    within: settings.defaultWithin,
    attributes: modernAttrs,
    struct_attributes: {
        text_topic: {label: "topic", order: 10},
        text_datetime: {label: "date", order: 9},
        text_sender: {label: "sender",
                      order: 8,
                      type: "set",
                    //   pattern: "<a href='mailto:<%= val.split('<')[1].split('>')[0] %>'><%= val.split('<')[0] %></span>"},
                      pattern: "<span> <%= val.replace(/</g, '&lt;').replace(/</g, '&lt;') %></span>"},
        text_receiver: {label: "receiver",
                        order: 7,
                        type: "set",
                        pattern: "<span> <%= val.replace(/</g, '&lt;').replace(/</g, '&lt;') %></span>"},
        "text_receiver-cc": {label: "copy",
                           order: 6,
                           type: "set",
                           pattern: "<span> <%= val.replace(/</g, '&lt;').replace(/</g, '&lt;') %></span>"}
    }
};

settings.corpora["ivip"] = {
    id: "ivip",
    title: "IVIP",
    description: 'Interaktion och variation i pluricentriska språk – Kommunikativa mönster i sverigesvenska och finlandssvenska<br><br>För åtkomst kontakta <a href="mailto:inga-lill.grahn@sprakochfolkminnen.se">Inga-Lill Grahn</a>.',
    limited_access: true,
    context: {
        "1 sentence": "1 sentence",
        "1 text": "1 text"
    },
    within: settings.defaultWithin,
    attributes: {
        pos: attrs.pos,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        prefix: attrs.prefix,
        suffix: attrs.suffix,
        w_normalised: {
            label: "normalized_wordform",
            isStructAttr: true
        },
        w_full: {
            label: "annotation",
            isStructAttr: true
        }
    },
    struct_attributes: {
        text_country: {label: "country", order: 20},
        text_city: {label: "city", order: 19},
        text_place: {label: "location", order: 18},
        text_participants: {label: "participants", order: 17},
        sentence_speaker_id: {label: "speaker", order: 16},
        sentence_speaker_role: {label: "speakerrole", order: 15},
        sentence_speaker_gender: {label: "speakergender", order: 14},
        sentence_speaker_age: {label: "speakerage", order: 13},
        sentence_speaker_region: {label: "speakerregion", order: 12},
        text_consentid: {label: "consentid", order: 11},
        text_date: {label: "date", order: 10},
        text_mediatype: {label: "mediatype", order: 9},
        sentence_start: {displayType: "hidden"},
        sentence_end: {displayType: "hidden"},
        text_mediafilepath: {displayType: "hidden"},
        text_mediafile: {displayType: "hidden"},
        text_mediafileext: {displayType: "hidden"}
    },
    custom_attributes: {
        video: {
            label: "video",
            renderItem: function(key, value, attrs, wordData, sentenceData, tokens) {

                var startTime = sentenceData['sentence_start'];
                var endTime = sentenceData['sentence_end'];
                var path = sentenceData['text_mediafilepath'];
                var file = sentenceData['text_mediafile'];
                var ext = sentenceData['text_mediafileext'];

                var videoLink = $('<span class="link">Visa video</span>');
                videoLink.click(function () {
                    var url = "http://k2xx.spraakdata.gu.se/ivip/data/Testkorpus/" + path +  file + "." + ext;

                    var scope = angular.element('#video-modal').scope();
                    scope.videos = [{'url': url, 'type': 'video/mp4'}];
                    scope.fileName = file + "." + ext;
                    scope.startTime = startTime / 1000;
                    scope.endTime = endTime / 1000;
                    scope.sentence = _.pluck(tokens, 'word').join(" ")
                    scope.open();
                    scope.$apply();
                });
                return videoLink;
            },
            customType: "struct"
        }
    }
};

settings.corpora.lasbart = {
    id: "lasbart",
    title: "LäSBarT – Lättläst svenska och barnbokstext",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_source: {label: "source"},
        text_type: {label: "type"},
        text_date: {label: "date"},
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_age: {label: "age"}
    }
};

settings.corpora.parole = {
    id: "parole",
    title: "PAROLE",
    description: "Material insamlat inom ramen för EU-projektet PAROLE. Innehåller romaner, dagstidningar, tidskrifter och webbtexter.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_id: {label: "text"},
        text_date: {label: "date"},
        text_title: {label: "title"},
        text_publisher: {label: "publisher"},
    }
};

settings.corpora.psalmboken = {
    id: "psalmboken",
    title: "Psalmboken (1937)",
    description: "",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_year: {label: "year"}
    }
};

settings.corpora["saltnld-sv"] = {
    id: "saltnld-sv",
    title: "SALT svenska-nederländska",
    description: "En samling parallella korpusar (svenska-nederländska), bestående av följande subkorpusar:\
<ul>\
<li>Bergman, Ingmar: Laterna magica</li>\
<li>Claus, Hugo: Rykten / De geruchten</li>\
<li>Dekker, Rudolf och van de Pol, Lotte: Kvinnor i manskläder / Vrouwen en mannekleren</li>\
<li>Ekman, Kerstin: Händelser vid vatten / Zwart water</li>\
<li>Froman, Ingmarie: Sverige och Belgien / Zweden und Belgiê</li>\
<li>Guillou, Jan: Fiendens fiende / De vijand van de vijand</li>\
<li>Gustafsson, Lars: En kakesättares eftermiddag / De namiddag van een tegelzetter</li>\
<li>Johanisson, Karin: Den mörka kontinenten / Het duistere continent</li>\
<li>Krabbé, Tim: De försvunna / Het gouden ei</li>\
<li>Mankell, Henning: Mördare utan ansikte / Moordenaar zonder gezicht</li>\
<li>Mulish, Harry: Överfallet / De aanslag</li>\
<li>Nilson, Peter: Hem till jorden / Terug naar de aarde</li>\
<li>van Paemel, Monika: Den första stenen / De eersten steen</li>\
<li>Sjöwall, Maj och Wahlöö, Per: Brandbilen som försvann / De brandweerauto die verdween</li>\
<li>Swartz, Richard: Room service</li>\
<li>Tunström, Göran: Tjuven / Die dief</li>\
<li>Wolkers, Jan: Turkisk konfekt / Turks fruit</li>\
</ul>\
\
Meningarna i korpusarna är sorterade i slumpvis ordning, för att man inte ska kunna återskapa originalet.",
    context: settings.defaultContext,
    within: settings.defaultWithin,
    attributes: modernAttrs,
    struct_attributes: {
    }
};

settings.corpora.snp7879 = {
    id: "snp7879",
    title: "SNP 78–79 (Riksdagens snabbprotokoll)",
    description: "Riksdagens snabbprotokoll 1978–1979.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {}
};

settings.corpora.sou = {
    id: "sou",
    title: "Statens offentliga utredningar",
    description: "Statens offentliga utredningar (SOU) i digitaliserat format. Samlingen är inte komplett men kommer att uppdateras.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_id: {label: "id"},
        text_librisid: {label: "librisid"}
    }
};

settings.corpora.suc2 = {
    id: "suc2",
    title: "SUC 2.0",
    description: "Stockholm-Umeå Corpus",
    within: settings.defaultWithin,
    context: {
        "1 sentence": "1 sentence"
    },
    attributes: _.extend({}, modernAttrs, {
        complemgram: {
            label: "complemgram",
            displayType: "hidden",
            type: "set"
        },
        compwf: {
            label: "compwf",
            displayType: "hidden",
            type: "set"
        }
    }),
    struct_attributes: {
        text_id: {label: "text"}
    }
};

settings.corpora.suc3 = {
    id: "suc3",
    title: "SUC 3.0",
    description: "Stockholm-Umeå Corpus",
    within: settings.defaultWithin,
    context: {
        "1 sentence": "1 sentence"
    },
    attributes: modernAttrs2,
    struct_attributes: {
        text_id: {label: "text"}
    }
};

settings.corpora.storsuc = {
    id: "storsuc",
    title: "SUC-romaner",
    description: "En samling romaner och andra böcker som har använts i urvalet till SUC. 58 böcker ingår.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_id: {label: "text"}
    }
};

settings.corpora.aspacsv = {
    id: "aspacsv",
    title: "ASPAC svenska",
    description: "Svenska delen av The Amsterdam Slavic Parallel Aligned Corpus",
    context: settings.defaultContext,
    within: settings.defaultWithin,
    attributes: modernAttrs,
    struct_attributes: {
        text_lang: {label: "lang"},
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_description: {label: "description"}
    }
};

settings.corpora.diabetolog = {
    id: "diabetolog",
    title: "DiabetologNytt (1996–1999)",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_year: {label: "year"},
        text_title: {label: "title"},
        text_source: {label: "url", type: "url"}
    }
};

settings.corpora.lt1996 = {
    id: "lt1996",
    title: "Läkartidningen 1996",
    description: "Läkartidningens publicerade artiklar under 1996.<br/>Antal artiklar: 2345",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: {
        pos: attrs.pos,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        entity: {
            label: "entity"
        },
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref,
        prefix: attrs.prefix,
        suffix: attrs.suffix
    },
    struct_attributes: {
        text_year: {label: "year"},
        text_article: {label: "article"},
        text_id: {label: "text"}
    }
};

settings.corpora.lt1997 = {
    id: "lt1997",
    title: "Läkartidningen 1997",
    description: "Läkartidningens publicerade artiklar under 1997.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lt1998 = {
    id: "lt1998",
    title: "Läkartidningen 1998",
    description: "Läkartidningens publicerade artiklar under 1998.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lt1999 = {
    id: "lt1999",
    title: "Läkartidningen 1999",
    description: "Läkartidningens publicerade artiklar under 1999.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lt2000 = {
    id: "lt2000",
    title: "Läkartidningen 2000",
    description: "Läkartidningens publicerade artiklar under 2000.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lt2001 = {
    id: "lt2001",
    title: "Läkartidningen 2001",
    description: "Läkartidningens publicerade artiklar under 2001.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lt2002 = {
    id: "lt2002",
    title: "Läkartidningen 2002",
    description: "Läkartidningens publicerade artiklar under 2002.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lt2003 = {
    id: "lt2003",
    title: "Läkartidningen 2003",
    description: "Läkartidningens publicerade artiklar under 2003.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lt2004 = {
    id: "lt2004",
    title: "Läkartidningen 2004",
    description: "Läkartidningens publicerade artiklar under 2004.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.lt2005 = {
    id: "lt2005",
    title: "Läkartidningen 2005",
    description: "Läkartidningens publicerade artiklar under 2005.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.smittskydd = {
    id: "smittskydd",
    title: "Smittskydd",
    description: "Smittskyddsinstitutets tidskrift, årgångarna 2002–2010.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_year: {label: "year"},
        text_issue: {label: "issue"},
        text_title: {label: "title"}
    }
};

settings.corpora.sfs = {
    id: "sfs",
    title: "Svensk författningssamling",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_title: {label: "title"},
        text_date: {label: "date"}
    }
};

settings.corpora.vivill = {
    id: "vivill",
    title: "Svenska partiprogram och valmanifest 1887–2010",
    description: "",
    within: {
        "sentence": "sentence",
        "5 sentence": "5 sentences"
    },
    context: {
        "1 sentence": "1 sentence",
        "5 sentence": "5 sentences"
    },
    attributes: modernAttrs,
    struct_attributes: {
        text_year: {label: "year", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "1887": "1887",
                "1902": "1902",
                "1904": "1904",
                "1905": "1905",
                "1908": "1908",
                "1911": "1911",
                "1912": "1912",
                "1914a|1914b": "1914",
                "1917": "1917",
                "1919": "1919",
                "1920": "1920",
                "1921": "1921",
                "1924": "1924",
                "1928": "1928",
                "1932": "1932",
                "1933": "1933",
                "1934": "1934",
                "1936": "1936",
                "1940": "1940",
                "1944": "1944",
                "1946": "1946",
                "1948": "1948",
                "1951": "1951",
                "1952": "1952",
                "1953": "1953",
                "1956": "1956",
                "1958": "1958",
                "1959": "1959",
                "1960": "1960",
                "1961": "1961",
                "1962": "1962",
                "1964": "1964",
                "1967": "1967",
                "1968": "1968",
                "1969": "1969",
                "1970": "1970",
                "1972": "1972",
                "1973": "1973",
                "1975": "1975",
                "1976": "1976",
                "1979": "1979",
                "1981": "1981",
                "1982": "1982",
                "1984": "1984",
                "1985": "1985",
                "1987": "1987",
                "1988": "1988",
                "1990": "1990",
                "1991": "1991",
                "1993": "1993",
                "1994": "1994",
                "1997": "1997",
                "1998": "1998",
                "1999": "1999",
                "2000": "2000",
                "2001": "2001",
                "2002": "2002",
                "2005": "2005",
                "2006": "2006",
                "2010": "2010"
            }
        },
        text_party: {
            label: "party",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            translationKey: "party_",
            dataset: [
                "all",
                "c",
                "rg",
                "fi",
                "fp",
                "jr",
                "kd",
                "la",
                "labp",
                "lisp",
                "mp",
                "m",
                "npf",
                "nyd",
                "pp",
                "sd",
                "k_h",
                "k_k",
                "svp",
                "lp",
                "s",
                "v"
            ],
            stringify: function(val) {
                return util.getLocaleString("party_" + val);
            }
        },
        text_type: {label: "type"}
    }
};

settings.corpora["wikipedia-sv"] = {
    id: "wikipedia-sv",
    title: "Svenska Wikipedia (augusti 2015)",
    description: "Samtliga artikar från svenska Wikipedia. Uppdateras regelbundet.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_title: {label: "article"},
        text_url: {label: "url", type: "url"}
    }
};

settings.corpora.strindbergromaner = {
    id: "strindbergromaner",
    title: "August Strindbergs samlade verk",
    description: "August Strindbergs samlade verk. Innehåller material från de 59 volymer som utgivits fram till år 2003.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "year"},
        text_sv: {label: "text_sv"},
        page_n: {label: "page"}
    }
};

settings.corpora.romi = {
    id: "romi",
    title: "Bonniersromaner I (1976–77)",
    description: "69 romaner utgivna 1976–77.",
    context: settings.spContext,
    within: settings.spWithin,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"}
    }
};

settings.corpora.romii = {
    id: "romii",
    title: "Bonniersromaner II (1980–81)",
    description: "60 romaner från 1980–81.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"}
    }
};

settings.corpora.romg = {
    id: "romg",
    title: "Äldre svenska romaner",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_year: {label: "year"}
    }
};

settings.corpora.rom99 = {
    id: "rom99",
    title: "Norstedtsromaner (1999)",
    description: "23 romaner utgivna 1999 på Norstedts förlag.",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_year: {label: "year"}
    }
};

settings.corpora["swefn-ex"] = {
    id: "swefn-ex",
    title: "Svenskt frasnät (SweFN)",
    description: '',
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        "text_created_by": {label: "created_by"},
/*      "element_name": {label: "element"},
        "lu_n": {label: ""},
        "supp_n": {label: ""},
        "copula_n": {label: ""},
        "sentence_id": {label: ""},*/
        "example_source": {label: "source"},
        "text_frame": {label: "frame"},
        "text_domain": {label: "domain"},
        "text_semantic_type": {label: "semantic_type"},
        "text_core_elements": {label: "core_elements"},
        "text_peripheral_elements": {label: "peripheral_elements"},
        "text_compound_patterns": {label: "compound_patterns"},
        "text_compound_pattern_examples": {label: "compound_pattern_examples"},
/*      "text_lexical_units_saldo": {label: "lexical_units_saldo"},
        "text_lexical_units_new": {label: "lexical_units_new"},*/
        "text_notes": {label: "notes"}
    }
};

settings.corpora.astranova = {
    id: "astranova",
    title: "Astra Nova 2008–2010",
    description: "<a target=\"_blank\" href=\"http://www.astranova.fi\">Astra Nova</a> är en tidskrift med feministisk prägel. Innehåller samtliga nummer av Astra Nova från perioden 2008–2010 med artiklar av finlandssvenska skribenter. Artiklar av utländska skribenter ingår inte i materialet, utan är bortplockade.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora["astra1960-1979"] = {
    id: "astra1960-1979",
    title: "Astra 1960–1979",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.bullen = {
    id: "bullen",
    title: "Bullen 2010–2012",
    description: "<a target=\"_blank\" href=\"http://www.karen.abo.fi/index.php?u[2]=0&u[3]=70\">Bullen</a> är Åbo Akademis Studentkårs informationsbulletin.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.fanbararen = {
    id: "fanbararen",
    title: "Fanbäraren 2011–2012",
    description: "<a target=\"_blank\" href=\"http://www.nylandsbrigadsgille.fi/sidor/?page_id=813\">Fanbäraren</a> är en tidskrift som utges gemensamt av Nylands brigad och Nylands Brigads Gille, med syfte att öka kännedomen om utbildningen vid Nylands Brigad och öka sammanhållningen mellan Gillets medlemmar.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.kallan = {
    id: "kallan",
    title: "Källan 2008–2010",
    description: "<a target=\"_blank\" href=\"http://www.sls.fi/kallan\">Källan</a> är Svenska litteratursällskapets tidskrift.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.jft = {
    id: "jft",
    title: "JFT 2000–2013",
    description: "<a target=\"_blank\" href=\"http://jff.fi/index.asp?page=5\">JFT</a> publiceras av Juridiska Föreningen i Finland r.f. Den är Nordens äldsta utkommande rättsvetenskapliga tidskrift.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.meddelanden = {
    id: "meddelanden",
    title: "Meddelanden från Åbo Akademi 2002–2010",
    description: "<a target=\"_blank\" href=\"http://www.abo.fi/meddelanden\">Meddelanden från Åbo Akademi</a> är Åbo Akademis tidning för extern och intern information. Materialet består av artiklar skrivna av redaktörerna Peter Sandström och Michael Karlsson",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.hankeiten = {
    id: "hankeiten",
    title: "Hankeiten 2006–2012",
    description: "<a target=\"_blank\" href=\"http://www.shsweb.fi/shs/arkiv/hankeiten1\">Hankeiten</a> är Svenska Handelshögskolans Studentkårs tidskrift.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.nyaargus = {
    id: "nyaargus",
    title: "Nya Argus 2010–2011",
    description: "<a target=\"_blank\" href=\"http://www.kolumbus.fi/nya.argus/\">Nya Argus</a> är en tidskrift som bevakar kultur, samhälle och debatt. Artiklar skrivna av utländska skribenter är bortplockade.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.pargaskungorelser2011 = {
    id: "pargaskungorelser2011",
    title: "Pargas Kungörelser 2011",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.pargaskungorelser2012 = {
    id: "pargaskungorelser2012",
    title: "Pargas Kungörelser 2012",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_issue: {label: "issue"}
    }
};

settings.corpora.borgabladet = {
    id: "borgabladet",
    title: "Borgåbladet 2012–2013",
    description: "<a target=\"_blank\" href=\"http://www.bbl.fi\">Borgåbladet</a> är en regional svenskspråkig dagstidning i Borgå med omnejd.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.sydosterbotten2010 = {
    id: "sydosterbotten2010",
    title: "Syd-Österbotten 2010",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.sydosterbotten2011 = {
    id: "sydosterbotten2011",
    title: "Syd-Österbotten 2011",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.sydosterbotten2012 = {
    id: "sydosterbotten2012",
    title: "Syd-Österbotten 2012",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.sydosterbotten2013 = {
    id: "sydosterbotten2013",
    title: "Syd-Österbotten 2013",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.sydosterbotten2014 = {
    id: "sydosterbotten2014",
    title: "Syd-Österbotten 2014",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_author: {label: "article_author"},
        text_section: {label: "article_section"}
    }
};

settings.corpora.vastranyland = {
    id: "vastranyland",
    title: "Västra Nyland 2012–2013",
    description: "<a target=\"_blank\" href=\"http://www.vastranyland.fi\">Västra Nyland</a> är en regional svenskspråkig dagstidning i Västra Nyland.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.ostranyland = {
    id: "ostranyland",
    title: "Östra Nyland 2012–2013",
    description: "<a target=\"_blank\" href=\"http://www.ostnyland.fi\">Östra Nyland</a> är en regional svenskspråkig dagstidning i Östra Nyland.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.abounderrattelser2012 = {
    id: "abounderrattelser2012",
    title: "Åbo Underrättelser 2012",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.abounderrattelser2013 = {
    id: "abounderrattelser2013",
    title: "Åbo Underrättelser 2013",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};


settings.corpora.at2012 = {
    id: "at2012",
    title: "Ålandstidningen 2012",
    description: "<a target=\"_blank\" href=\"http://www.alandstidningen.ax/\">Ålandstidningen</a> är en regional svenskspråkig dagstidning på Åland.",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.vasabladet1991 = {
    id: "vasabladet1991",
    title: "Vasabladet 1991",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"},
        text_type: {label: "section"}
    }
};

settings.corpora.vasabladet2012 = {
    id: "vasabladet2012",
    title: "Vasabladet 2012",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
    }
};

settings.corpora.vasabladet2013 = {
    id: "vasabladet2013",
    title: "Vasabladet 2013",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.vasabladet2014 = {
    id: "vasabladet2014",
    title: "Vasabladet 2014",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_author: {label: "article_author"},
        text_section: {label: "article_section"}
    }
};

settings.corpora.osterbottenstidning2011 = {
    id: "osterbottenstidning2011",
    title: "Österbottens Tidning 2011",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.osterbottenstidning2012 = {
    id: "osterbottenstidning2012",
    title: "Österbottens Tidning 2012",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.osterbottenstidning2013 = {
    id: "osterbottenstidning2013",
    title: "Österbottens Tidning 2013",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.osterbottenstidning2014 = {
    id: "osterbottenstidning2014",
    title: "Österbottens Tidning 2014",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: sattrs.date,
        text_author: {label: "article_author"},
        text_section: {label: "article_section"}
    }
};

settings.corpora.fnb1999 = {
    id: "fnb1999",
    title: "FNB 1999",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"},
        text_title: {label: "title"}
    }
};

settings.corpora.fnb2000 = {
    id: "fnb2000",
    title: "FNB 2000",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"},
        text_title: {label: "title"}
    }
};

settings.corpora.hbl1991 = {
    id: "hbl1991",
    title: "Hufvudstadsbladet 1991",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "year"},
        text_type: {label: "section"}
    }
};

settings.corpora.hbl1998 = {
    id: "hbl1998",
    title: "Hufvudstadsbladet 1998",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_year: {label: "year"}
    }
};

settings.corpora.hbl1999 = {
    id: "hbl1999",
    title: "Hufvudstadsbladet 1999",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_year: {label: "year"}
    }
};

settings.corpora.hbl20122013 = {
    id: "hbl20122013",
    title: "Hufvudstadsbladet (2012–)2013",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.hbl2014 = {
    id: "hbl2014",
    title: "Hufvudstadsbladet 2014",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_date: {label: "date"}
    }
};

settings.corpora.talbanken = {
    id: "talbanken",
    title: "Talbanken",
    description: "",
    within: settings.defaultWithin,
    context: settings.defaultContext,
    attributes: modernAttrs,
    struct_attributes: {
    }
};

settings.corpora.klarsprak = {
    id: "klarsprak",
    title: "Förvaltningsmyndigheters texter",
    description: "",
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_title: {label: "title"},
        text_textid: {label: "id"},
        text_organisation: {label: "organization"},
        text_author: {label: "author"},
        text_genre: {label: "genre"},
        text_textcategory: {label: "category"},
        text_year: {label: "year"},
        text_month: {label: "month"},
        type_type: {
            label: "type",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "heading": "Heading",
                "section_heading": "Section heading",
                "signature": "Signature"
            }
        }
    }
};

settings.corpora.sw1203 = {
    id: "sw1203",
    title: "SW1203-uppsatser",
    description: 'För åtkomst kontakta <a href="mailto:ingegerd.enstroem@svenska.gu.se">Ingegerd Enström</a>.',
    limited_access: true,
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_type: {
            label: "type",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "A: Inträdesuppsats": "A: Inträdesuppsats",
                "B: Mitterminsuppsats": "B: Mitterminsuppsats",
                "C: Slutprovsuppsats": "C: Slutprovsuppsats"
            }
        },
        text_student: {label: "student"},
        text_l1: {label: "tisus_l1"},
        text_gender: {
            label: "gender",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "F": "Kvinna",
                "M": "Man"
            }
        },
        text_birthyear: {label: "birthyear"},
        text_a: {label: "a"},
        text_b: {label: "b"},
        text_cd: {label: "c/d"},
        text_semester: {
            label: "semester",
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "HT12": "HT12",
                "VT13": "VT13"
            }
        }
    }
};

settings.corpora.tisus = {
    id: "tisus",
    title: "TISUS-texter",
    description: 'För åtkomst kontakta <a href="mailto:elena.volodina@svenska.gu.se">Elena Volodina</a>.',
    limited_access: true,
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        text_id: {label: "id"},
        text_age: {label: "age"},
        text_gender: {label: "gender"},
        text_residencetime: {label: "residencetime"},
        text_education: {label: "education"},
        text_l1: {label: "tisus_l1", type: "set"},
        text_lf1: {label: "tisus_lf1"},
        text_lf2: {label: "tisus_lf2"},
        text_sum: {label: "sum"},
        text_written: {label: "tisus_written"},
        text_oral: {label: "tisus_oral"},
        text_finalgrade: {label: "finalgrade"},
        text_proficiencylevel: {label: "proficiencylevel"},
        text_date: {label: "date"}
    }
};

settings.corpora.ansokningar = {
    id: "ansokningar",
    title: "Ansökningar",
    description: 'För åtkomst kontakta <a href="mailto:lena.rogstroem@svenska.gu.se">Lena Rogström</a>.',
    limited_access: true,
    context: settings.defaultContext,
    within: settings.defaultWithin,
    attributes: modernAttrs,
    struct_attributes: {
        text_id: {label: "id"},
        text_gender: {label: "gender"},
        text_birthyear: {label: "birthyear"}
    }
};

settings.corpora.coctaill = {
    id: "coctaill",
    title: "COCTAILL",
    description: 'För åtkomst kontakta <a href="mailto:elena.volodina@svenska.gu.se">Elena Volodina</a>.',
    limited_access: true,
    context: settings.spContext,
    within: settings.spWithin,
    attributes: modernAttrs,
    struct_attributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        text_date: {label: "date"},
        lesson_level: {label: "coctaill_level", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "A1": "A1",
                "A2": "A2",
                "B1": "B1",
                "B2": "B2",
                "C1": "C1"}
        },
        lessontext_genre: {label: "coctaill_genre", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "evaluation/advertisement": "evaluation/advertisement",
                "evaluation/argumentation": "evaluation/argumentation",
                "evaluation/discussion": "evaluation/discussion",
                "evaluation/exposition": "evaluation/exposition",
                "evaluation/personal reflection": "evaluation/personal reflection",
                "evaluation/persuasion": "evaluation/persuasion",
                "evaluation/review": "evaluation/review",
                "facts/autobiography": "facts/autobiography",
                "facts/biography": "facts/biography",
                "facts/demonstration": "facts/demonstration",
                "facts/explanation": "facts/explanation",
                "facts/facts": "facts/facts",
                "facts/geographical facts": "facts/geographical facts",
                "facts/historical facts": "facts/historical facts",
                "facts/instruction": "facts/instruction",
                "facts/news article": "facts/news article",
                "facts/procedures": "facts/procedures",
                "facts/report": "facts/report",
                "facts/rules": "facts/rules",
                "narration/description": "narration/description",
                "narration/fiction": "narration/fiction",
                "narration/news article": "narration/news article",
                "narration/personal story": "narration/personal story",
                "other/anecdote": "other/anecdote",
                "other/dialogue": "other/dialogue",
                "other/language tip": "other/language tip",
                "other/letter": "other/letter",
                "other/lyrics": "other/lyrics",
                "other/notice": "other/notice",
                "other/poem": "other/poem",
                "other/questionnaire": "other/questionnaire",
                "other/quotation": "other/quotation",
                "other/recipe": "other/recipe",
                "other/rhyme": "other/rhyme"
            }
        },
        list_unit: {label: "coctaill_list_unit", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "characters": "characters",
                "dialogues": "dialogues",
                "dictionary_entry": "dictionary_entry",
                "full_sentences": "full_sentences",
                "incomplete_sentences": "incomplete_sentences",
                "numbers": "numbers",
                "phrases": "phrases",
                "question_answers": "question_answers",
                "single_words": "single_words",
                "texts": "texts"
            }
        },
        list_skill: {label: "coctaill_list_skill", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "grammar": "grammar",
                "listening": "listening",
                "pronunciation": "pronunciation",
                "reading": "reading",
                "speaking": "speaking",
                "spelling": "spelling",
                "vocabulary": "vocabulary",
                "writing": "writing"
            }
        },
        lessontext_topic: {label: "coctaill_lessontext_topic", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "animals": "animals",
                "arts": "arts",
                "clothes and appearances": "clothes and appearances",
                "crime and punishment": "crime and punishment",
                "culture and traditions": "culture and traditions",
                "daily life": "daily life",
                "economy": "economy",
                "education": "education",
                "family and relatives": "family and relatives",
                "famous people": "famous people",
                "famous_people": "famous_people",
                "food and drink": "food and drink",
                "free time; entertainment": "free time; entertainment",
                "greetings/introductions": "greetings/introductions",
                "health and body care": "health and body care",
                "history": "history",
                "house and home; environment": "house and home; environment",
                "jobs and professions": "jobs and professions",
                "languages": "languages",
                "nature": "nature",
                "personal identification": "personal identification",
                "places": "places",
                "politics and power": "politics and power",
                "politics and power,relations with other people": "politics and power,relations with other people",
                "relations with other people": "relations with other people",
                "religion; myths and legends": "religion; myths and legends",
                "science and technology": "science and technology",
                "services": "services",
                "shopping": "shopping",
                "sports": "sports",
                "technology": "technology",
                "travel": "travel",
                "weather": "weather",
                "weather and nature": "weather and nature"
            }
        },
        activity_instruction_skill: {label: "coctaill_activity_instruction_skill", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "grammar": "grammar",
                "information_search": "information_search",
                "listening": "listening",
                "pronunciation": "pronunciation",
                "reading": "reading",
                "speaking": "speaking",
                "spelling": "spelling",
                "vocabulary": "vocabulary",
                "writing": "writing"
            }
        },
        activity_instruction_format: {label: "coctaill_activity_instruction_format", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "brainstorming": "brainstorming",
                "category identification": "category identification",
                "category substitution": "category substitution",
                "dialogue": "dialogue",
                "dictation": "dictation",
                "discussion": "discussion",
                "drawing": " drawing",
                "error correction": "error correction",
                "essay": "essay",
                "form manipulation": "form manipulation",
                "free writing": "free writing",
                "free_answers": "free_answers",
                "gaps": "gaps",
                "information_search": "information_search",
                "matching": "matching",
                "monologue": "monologue",
                "multiple-choice": "multiple-choice",
                "narration": "narration",
                "pre-reading": "pre-reading",
                "question/answers": "question/answers",
                "reading aloud": "reading aloud",
                "reordering/restructuring": "reordering/restructuring",
                "role-playing": "role-playing",
                "sorting": "sorting",
                "summary": "summary",
                "text questions": "text questions",
                "translation": "translation",
                "true-false/yes-no": "true-false/yes-no",
                "wordbank": "wordbank"
            }
        },
        task_skill: {label: "coctaill_task_skill", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "essay": "essay",
                "grammar": "grammar",
                "listening": "listening",
                "pronunciation": "pronunciation",
                "reading": "reading",
                "speaking": "speaking",
                "spelling": "spelling",
                "vocabulary": "vocabulary",
                "writing": "writing"
            }
        },
        task_format: {label: "coctaill_task_format", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "brainstorming": "brainstorming",
                "category identification": "category identification",
                "category substitution": "category substitution",
                "dialogue": "dialogue",
                "dictation": "dictation",
                "discussion": "discussion",
                "drawing": " drawing",
                "error correction": "error correction",
                "essay": "essay",
                "form manipulation": "form manipulation",
                "free writing": "free writing",
                "free_answers": "free_answers",
                "gaps": "gaps",
                "information_search": "information_search",
                "matching": "matching",
                "monologue": "monologue",
                "multiple-choice": "multiple-choice",
                "narration": "narration",
                "pre-reading": "pre-reading",
                "question/answers": "question/answers",
                "reading aloud": "reading aloud",
                "reordering/restructuring": "reordering/restructuring",
                "role-playing": "role-playing",
                "sorting": "sorting",
                "summary": "summary",
                "text questions": "text questions",
                "translation": "translation",
                "true-false/yes-no": "true-false/yes-no",
                "wordbank": "wordbank"
            }
        },
        language_example_unit: {label: "coctaill_language_example_unit", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "characters": "characters",
                "complete_sentences": "complete_sentences",
                "dialogues": "dialogues",
                "dictionary_entry": "dictionary_entry",
                "full_sentences": "full_sentences",
                "incomplete_sentences": "incomplete_sentences",
                "numbers": "numbers",
                "phrases": "phrases",
                "phrases single words": "phrases single words",
                "question_answers": "question_answers",
                "singe words": "singe words",
                "single words": "single words",
                "single_words": "single_words",
                "texts": "texts"
            }
        },
        language_example_skill: {label: "coctaill_language_example_skill", type: "set", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "grammar": "grammar",
                "listening": "listening",
                "pronunciation": "pronunciation",
                "reading": "reading",
                "speaking": "speaking",
                "spelling": "spelling",
                "vocabulary": "vocabulary",
                "writing": "writing"
            }
        },
        extra_dummy:      {label: "+extra", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller},
        subheading_dummy: {label: "+subheading", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller},
        contents_dummy:   {label: "+contents", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller},
        lessontext_dummy: {label: "+lessontext", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller},
        list_dummy:       {label: "+list", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller},
        activity_instruction_dummy: {label: "+activity_instruction", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller},
        task_dummy: {label: "+task", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller},
        language_example_dummy: {label: "+language_example", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller},
        lesson_dummy: {label: "+lesson", displayType: "select", dataset: {"-": "-"}, opts: {}, extended_template: '<input type="hidden">', controller: selectType.controller}
    }
};

settings.corpora.twitter = {
    id: "twitter",
    title: "Twittermix",
    description: "Material från ett urval av svenska Twitteranvändare. Uppdateras regelbundet.",
    within: {
        "sentence": "sentence",
        "text": "text"
    },
    context: {
        "1 sentence": "1 sentence",
        "1 text": "1 text"
    },
    attributes: modernAttrs,
    struct_attributes: {
        user_username: {label: "username2"},
        user_name: {label: "name"},
        text_datetime: {label: "date"},
        text_weekday: {label: "weekday"},
        text_hashtags: {label: "hashtags", type: "set"},
        text_mentions: {label: "mentions", type: "set"},
        text_retweets: {label: "retweets"},
        text_location: {label: "tweet_location"},
        text_coordinates: {label: "coordinates"},
        text_replytouser: {label: "replytouser"},
        text_language: {label: "language"},
        text_id: {label: "id", displayType: "hidden"},
        user_location: {label: "user_location"},
        user_followers: {label: "followers"},
        user_following: {label: "following"},
        user_tweets: {label: "tweets"},
        user_description: {
                    label: "description",
                    pattern: '<p style="margin-left: 5px;"><%=val%></p>'
            },
        user_url: {label: "website", type: "url"},
        user_created: {label: "user_since"},
        user_trstrank: {label: "trstrank"},
    },
    custom_attributes: {
        text_url: {
            label: "url",
            pattern: "<a href='http://twitter.com/<%= struct_attrs.user_username %>/status/<%= struct_attrs.text_id %>' target='_blank'>http://twitter.com/<%= struct_attrs.user_username %>/status/<%= struct_attrs.text_id %></a>",
            customType: "struct"
            }
    }
};

settings.corpora["twitter-pldebatt-130612"] = {
    id: "twitter-pldebatt-130612",
    title: "Twitter - Partiledardebatt juni 2013",
    description: "Material från Twitter, insamlat under partiledardebatten 12 juni 2013 samt några dagar före och efter.",
    within: {
        "sentence": "sentence",
        "text": "text"
    },
    context: {
        "1 sentence": "1 sentence",
        "1 text": "1 text"
    },
    attributes: modernAttrs,
    struct_attributes: {
        user_username: {label: "username2"},
        user_name: {label: "name"},
        text_datetime: {label: "date"},
        text_weekday: {label: "weekday"},
        text_hashtags: {label: "hashtags", type: "set"},
        text_mentions: {label: "mentions", type: "set"},
        text_retweets: {label: "retweets"},
        text_location: {label: "location"},
        text_coordinates: {label: "coordinates"},
        text_replytouser: {label: "replytouser"},
        text_id: {label: "id", displayType: "hidden"},
        user_location: {label: "user_location"},
        user_followers: {label: "followers"},
        user_following: {label: "following"},
        user_tweets: {label: "tweets"},
        user_description: {
                    label: "description",
                    pattern: '<p style="margin-left: 5px;"><%=val%></p>'
            },
        user_url: {label: "website", type: "url"},
        user_created: {label: "user_since"}
    },
    custom_attributes: {
        text_url: {
            label: "url",
            pattern: "<a href='http://twitter.com/<%= struct_attrs.user_username %>/status/<%= struct_attrs.text_id %>' target='_blank'>http://twitter.com/<%= struct_attrs.user_username %>/status/<%= struct_attrs.text_id %></a>",
            customType: "struct"
            }
    }
};

settings.corpora["twitter-pldebatt-131006"] = {
    id: "twitter-pldebatt-131006",
    title: "Twitter - Partiledardebatt oktober 2013",
    description: "Material från Twitter, insamlat under partiledardebatten 6 oktober 2013 samt några dagar före och efter.",
    within: {
        "sentence": "sentence",
        "text": "text"
    },
    context: {
        "1 sentence": "1 sentence",
        "1 text": "1 text"
    },
    attributes: modernAttrs,
    struct_attributes: {
        user_username: {label: "username2"},
        user_name: {label: "name"},
        text_datetime: {label: "date"},
        text_weekday: {label: "weekday"},
        text_hashtags: {label: "hashtags", type: "set"},
        text_mentions: {label: "mentions", type: "set"},
        text_retweets: {label: "retweets"},
        text_location: {label: "location"},
        text_coordinates: {label: "coordinates"},
        text_replytouser: {label: "replytouser"},
        text_id: {label: "id", displayType: "hidden"},
        user_location: {label: "user_location"},
        user_followers: {label: "followers"},
        user_following: {label: "following"},
        user_tweets: {label: "tweets"},
        user_description: {
                    label: "description",
                    pattern: '<p style="margin-left: 5px;"><%=val%></p>'
            },
        user_url: {label: "website", type: "url"},
        user_created: {label: "user_since"}
    },
    custom_attributes: {
        text_url: {
            label: "url",
            pattern: "<a href='http://twitter.com/<%= struct_attrs.user_username %>/status/<%= struct_attrs.text_id %>' target='_blank'>http://twitter.com/<%= struct_attrs.user_username %>/status/<%= struct_attrs.text_id %></a>",
            customType: "struct"
            }
    }
};

settings.corpora["twitter-pldebatt-140504"] = {
    id: "twitter-pldebatt-140504",
    title: "Twitter - Partiledardebatt maj 2014",
    description: "Material från Twitter, insamlat under partiledardebatten 4 maj 2014 samt några dagar före och efter.",
    within: {
        "sentence": "sentence",
        "text": "text"
    },
    context: {
        "1 sentence": "1 sentence",
        "1 text": "1 text"
    },
    attributes: modernAttrs,
    struct_attributes: {
        user_username: {label: "username2"},
        user_name: {label: "name"},
        text_datetime: {label: "date"},
        text_weekday: {label: "weekday"},
        text_hashtags: {label: "hashtags", type: "set"},
        text_mentions: {label: "mentions", type: "set"},
        text_retweets: {label: "retweets"},
        text_location: {label: "location"},
        text_coordinates: {label: "coordinates"},
        text_replytouser: {label: "replytouser"},
        text_id: {label: "id", displayType: "hidden"},
        user_location: {label: "user_location"},
        user_followers: {label: "followers"},
        user_following: {label: "following"},
        user_tweets: {label: "tweets"},
        user_description: {
                    label: "description",
                    pattern: '<p style="margin-left: 5px;"><%=val%></p>'
            },
        user_url: {label: "website", type: "url"},
        user_created: {label: "user_since"}
    },
    custom_attributes: {
        text_url: {
            label: "url",
            pattern: "<a href='http://twitter.com/<%= struct_attrs.user_username %>/status/<%= struct_attrs.text_id %>' target='_blank'>http://twitter.com/<%= struct_attrs.user_username %>/status/<%= struct_attrs.text_id %></a>",
            customType: "struct"
            }
    }
};

settings.corpora.gdc = {
    id: "gdc",
    title: "Gothenburg Dialogue Corpus (GDC)",
    description: 'För åtkomst kontakta <a href="mailto:cajsa.ottesjo@gu.se">Cajsa Ottesjö</a>.',
    limited_access: true,
    within: settings.defaultWithin,
    context: {
        "1 sentence": "1 sentence",
        "3 sentence": "3 sentences"
    },
    attributes: {
        wordclean: {label: "normalized_wordform"},
        pos: attrs.pos,
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        saldo: attrs.saldo,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref,
        prefix: attrs.prefix,
        suffix: attrs.suffix
    },
    struct_attributes: {
        "text_activity1": {label: "activity1"},
        "text_activity2": {label: "activity2"},
        "text_activity3": {label: "activity3"},
        "text_title": {label: "title"},
        "text_duration": {label: "duration"},
        "text_project": {label: "project"},
        "line_speaker": {label: "speaker"},
        "line_speakergender": {label: "gender"},
        "text_date": {label: "date"},
        "section_name": {label: "section"}
        // TODO: this gives some error, fix this.
        //"meta_comment": {label: "comment", type: "set"}
    }
};

settings.corpora.mepac = {
    id: "mepac",
    title: "MEPAC",
    description: 'För åtkomst kontakta <a href="mailto:anna_w.gustafsson@nordlund.lu.se">Anna W Gustafsson</a>.',
    limited_access: true,
    context: {
        "1 sentence": "1 sentence",
        "1 text": "1 text"
    },
    within: settings.defaultWithin,
    attributes: modernAttrs,
    struct_attributes: {
        "text_blog": {label: "author"},
        "text_date": {label: "date"},
        "text_type": {label: "type", displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "patient": "patient",
                "närstående": "närstående"
            }
        }
    }
};

settings.corpora.forhor = {
    id: "forhor",
    title: "Förhör",
    description: 'För åtkomst kontakta <a href="mailto:ylva.byrman@svenska.gu.se">Ylva Byrman</a>.',
    limited_access: true,
    context: settings.spContext,
    within: settings.spWithin,
    attributes: modernAttrs,
    struct_attributes: {
        "text_fall": {label: "fall"},
        "text_hord": {label: "hord"},
        "text_fl1": {label: "fl1"},
        "text_fl2": {label: "fl2"},
        "text_telefon": {label: "telefon"},
        "text_bandat": {label: "bandat"},
        "text_samtycke": {label: "samtycke"},
        "text_forsvarare": {label: "forsvarare"},
        "text_skribent": {label: "skribent"},
        "text_tolkat": {label: "tolkat"}
    }
};

settings.corpora.soexempel = {
    id: "soexempel",
    title: "Språkprov SO 2009",
    description: 'De drygt 94 000 språkexemplen är hämtade ur Svensk ordbok utgiven av Svenska Akademien (2009). '+
                  'Exemplens uppgift är att stödja ordboksdefinitionerna och att ge information om uppslagsordens fraseologi. ' +
                  '<br><br>För åtkomst kontakta <a href="mailto:emma.skoldberg@svenska.gu.se">Emma Sköldberg</a>.',
    limited_access: true,
    within: settings.spWithin,
    context: settings.spContext,
    attributes: modernAttrs,
    struct_attributes: {
        "text_date": {label: "year"},
        "entry_word": {label: "entryword"},
        "entry_entryno": {label: "entryno"},
        "entry_sense1": {label: "sense1"},
        "entry_sense2": {label: "sense2"}
    }
};

// FSV
settings.fsvattributes = {
    lemma : settings.fsvlemma,
    lex : settings.fsvlex,
    posset : settings.posset,
    variants : settings.fsvvariants
};

//SDHK
settings.sdhkdescription ='Svenskt Diplomatarium - från <a href="http://www.riksarkivet.se/sdhk" target="_blank">Riksarkivet</a>';
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

//KUBHIST
settings.kubhistattributes = {
    lemma : attrs.baseform,
    pos : attrs.pos,
    lex : attrs.lemgram,
    dalinlex : attrs.dalinlemgram,
    dephead : attrs.dephead,
    deprel : attrs.deprel,
    ref : attrs.ref,
    saldo : attrs.saldo,
    prefix : attrs.prefix,
    suffix : attrs.suffix
};

settings.kubhiststruct_attributes = {
    text_title : {
        label : "title",
        displayType : "select",
        localize : false,
        opts : settings.liteOptions
    },
    text_date : {label : "date"},
    text_edition : {label : "edition"},
    text_periodofpublication : {label : "periodofpublication"},
    text_holderofpublicationlicense : {label : "holderofpublicationlicense"},
    text_publishingfrequency : {label : "publishingfrequency"},
    text_publishingdays : {label : "publishingdays"},
    text_completetitle : {label : "completetitle"},
    text_publisher : {label : "publisher"},
    text_issn : {label : "issn"},
    text_politicaltendency : {label : "politicaltendency"},
    text_annualprice : {label : "annualprice"},
    text_editorialplace : {label : "editorialplace"},
    text_typearea : {label : "typearea"},
    text_numberofpages : {label : "numberofpages"},
    text_publicationtype : {label : "publicationtype"},
    text_editor : {label : "editor"},
    text_printedin : {label : "printedin"},
    text_printedby : {label : "printedby"},
    text_commentaries : {label : "commentaries"},
    page_no : {label : "page"}
};

settings.aftonbladstruct_attributes = {
    text_title : {
        label : "title",
        displayType : "select",
        localize : false,
        opts : settings.liteOptions
    },
    text_date : {label : "date"},
    text_issn : {label : "issn"},
    page_no : {label : "page"}
};

digidailydescription = '<a href="http://digidaily.kb.se/">Digidaily</a> är ett utvecklingsprojekt där Riksarkivet, Kungliga biblioteket och Mittuniversitetet tillsammans ska utveckla rationella metoder och processer för digitalisering av dagstidningar.'


//UB-KVT
settings.ubkvtattributes = {
    lemma: attrs.baseform,
    pos : attrs.pos,
    msd : attrs.msd,
    lex : attrs.lemgram,
    dalinlex : attrs.dalinlemgram,
    dephead : attrs.dephead,
    deprel : attrs.deprel,
    ref : attrs.ref,
    saldo : attrs.saldo,
    prefix : attrs.prefix,
    suffix : attrs.suffix
};
settings.ubkvtstruct_attributes = {
    text_title : {
        label : "title",
        displayType : "select",
        localize : false,
        opts : settings.liteOptions
    },
    text_year : {label : "year"},
    page_nr : {label : "page"}
};

//RUNEBERG
settings.runebergattributes = {
    msd : attrs.msd,
    lemma : attrs.baseform,
    lex : attrs.lemgram,
    saldo : attrs.saldo,
    prefix : attrs.prefix,
    suffix : attrs.suffix,
    dephead : attrs.dephead,
    deprel : attrs.deprel,
    ref : attrs.ref,
    typograph : {
            label : "typography",
            type : "set",
        displayType : "select",
        translationKey : "fab_",
        dataset : [
            "footnote",
            "small",
            "headline",
            "italic"
            ],
        opts : settings.liteOptions
        }
};

settings.runebergstruct_attributes = {
    text_title : {
        label : "title",
        displayType : "select",
        localize : false,
        opts : settings.liteOptions
    },
    text_date : {label : "date"}
};

// FSVB

settings.corporafolders.fsvb = {
    title : "Fornsvenska textbanken",
    contents : ["fsv-profanprosa","fsv-verser"],
    description : settings.fsvdescription
};

settings.corporafolders.fsvb.aldre = {
    title : "Äldre fornsvenska",
    contents : ["fsv-aldrelagar" , "fsv-aldrereligiosprosa"]
};

settings.corporafolders.fsvb.yngre = {
    title : "Yngre fornsvenska",
    contents : ["fsv-yngrelagar",  "fsv-yngrereligiosprosa", "fsv-yngretankebocker"]
};

settings.corporafolders.fsvb.nysvenska = {
    title : "Nysvenska",
    contents : ["fsv-nysvensklagar",  "fsv-nysvenskdalin", "fsv-nysvenskkronikor", "fsv-nysvenskovrigt", "fsv-nysvenskbibel"]
};

/*
 * KUBHIST
 */

settings.corporafolders.kubhist = {
    title : "Kubhist",
    contents : []
};

settings.corporafolders.kubhist.aftonbladet = {
    title : "Aftonbladet",
    contents : ["kubhist-aftonbladet-1830", "kubhist-aftonbladet-1840", "kubhist-aftonbladet-1850", "kubhist-aftonbladet-1860"]
};

settings.corporafolders.kubhist.blekingsposten = {
    title : "Blekingsposten",
    contents : ["kubhist-blekingsposten-1850", "kubhist-blekingsposten-1860", "kubhist-blekingsposten-1870", "kubhist-blekingsposten-1880"]
};

settings.corporafolders.kubhist.bollnastidning = {
    title : "Bollnäs tidning",
    contents : ["kubhist-bollnastidning-1870", "kubhist-bollnastidning-1880"]
};

settings.corporafolders.kubhist.dalpilen = {
    title : "Dalpilen",
    contents : ["kubhist-dalpilen-1850", "kubhist-dalpilen-1860", "kubhist-dalpilen-1870", "kubhist-dalpilen-1880", "kubhist-dalpilen-1890", "kubhist-dalpilen-1900", "kubhist-dalpilen-1910", "kubhist-dalpilen-1920"]
};

settings.corporafolders.kubhist.fahluweckoblad = {
    title : "Fahlu weckoblad",
    contents : ["kubhist-fahluweckoblad-1780", "kubhist-fahluweckoblad-1790", "kubhist-fahluweckoblad-1800", "kubhist-fahluweckoblad-1810", "kubhist-fahluweckoblad-1820"]
};

settings.corporafolders.kubhist.faluposten = {
    title : "Faluposten",
    contents : ["kubhist-faluposten-1860", "kubhist-faluposten-1870", "kubhist-faluposten-1880", "kubhist-faluposten-1890"]
};

settings.corporafolders.kubhist.folketsrost = {
    title : "Folkets röst",
    contents : ["kubhist-folketsrost-1850", "kubhist-folketsrost-1860"]
};

settings.corporafolders.kubhist.gotlandstidning = {
    title : "Gotlands tidning",
    contents : ["kubhist-gotlandstidning-1860", "kubhist-gotlandstidning-1870", "kubhist-gotlandstidning-1880"]
};

settings.corporafolders.kubhist.goteborgsweckoblad = {
    title : "Göteborgs weckoblad",
    contents : ["kubhist-goteborgsweckoblad-1870", "kubhist-goteborgsweckoblad-1880", "kubhist-goteborgsweckoblad-1890"]
};

settings.corporafolders.kubhist.gotheborgsweckolista = {
    title : "Götheborgs weckolista",
    contents : ["kubhist-gotheborgsweckolista-1740", "kubhist-gotheborgsweckolista-1750"]
};

settings.corporafolders.kubhist.jonkopingsbladet = {
    title : "Jönköpingsbladet",
    contents : ["kubhist-jonkopingsbladet-1840", "kubhist-jonkopingsbladet-1850", "kubhist-jonkopingsbladet-1860", "kubhist-jonkopingsbladet-1870"]
};

settings.corporafolders.kubhist.kalmar = {
    title : "Kalmar",
    contents : ["kubhist-kalmar-1860", "kubhist-kalmar-1870", "kubhist-kalmar-1880", "kubhist-kalmar-1890", "kubhist-kalmar-1900", "kubhist-kalmar-1910"]
};

settings.corporafolders.kubhist.lindesbergsallehanda = {
    title : "Lindesbergs allehanda",
    contents : ["kubhist-lindesbergsallehanda-1870", "kubhist-lindesbergsallehanda-1880"]
};

settings.corporafolders.kubhist.norraskane = {
    title : "Norra Skåne",
    contents : ["kubhist-norraskane-1880", "kubhist-norraskane-1890"]
};

settings.corporafolders.kubhist.postochinrikestidning = {
    title : "Post- och Inrikes Tidningar",
    contents : ["kubhist-postochinrikestidning-1770", "kubhist-postochinrikestidning-1780", "kubhist-postochinrikestidning-1790", "kubhist-postochinrikestidning-1800",
        "kubhist-postochinrikestidning-1810", "kubhist-postochinrikestidning-1820", "kubhist-postochinrikestidning-1830", "kubhist-postochinrikestidning-1840",
        "kubhist-postochinrikestidning-1850", "kubhist-postochinrikestidning-1860",]
};

settings.corporafolders.kubhist.stockholmsposten = {
    title : "Stockholmsposten",
    contents : ["kubhist-stockholmsposten-1770", "kubhist-stockholmsposten-1780", "kubhist-stockholmsposten-1790", "kubhist-stockholmsposten-1800",
        "kubhist-stockholmsposten-1810", "kubhist-stockholmsposten-1820", "kubhist-stockholmsposten-1830"]
};

settings.corporafolders.kubhist.tidningforwenersborg = {
    title : "Tidning för Wenersborgs stad och län",
    contents : ["kubhist-tidningforwenersborg-1840" , "kubhist-tidningforwenersborg-1850", "kubhist-tidningforwenersborg-1860", "kubhist-tidningforwenersborg-1870",
        "kubhist-tidningforwenersborg-1880", "kubhist-tidningforwenersborg-1890"]
};

settings.corporafolders.kubhist.wermlandslanstidning = {
    title : "Wermlands läns tidning",
    contents : ["kubhist-wermlandslanstidning-1870"]
};

settings.corporafolders.kubhist.wernamotidning = {
    title : "Wernamo tidning",
    contents : ["kubhist-wernamotidning-1870", "kubhist-wernamotidning-1880"]
};

settings.corporafolders.kubhist.ostergotlandsveckoblad = {
    title : "Östergötlands veckoblad",
    contents : ["kubhist-ostergotlandsveckoblad-1880", "kubhist-ostergotlandsveckoblad-1890"]
};

settings.corporafolders.kubhist.ostgotaposten = {
    title : "Östgötaposten",
    contents : ["kubhist-ostgotaposten-1890", "kubhist-ostgotaposten-1900", "kubhist-ostgotaposten-1910"]
};

settings.corporafolders.ubkvt = {
    title : "Kvinnotidningar",
    contents : ["ub-kvt-dagny", "ub-kvt-hertha", "ub-kvt-idun", "ub-kvt-kvt", "ub-kvt-morgonbris", "ub-kvt-rostratt", "ub-kvt-tidevarvet"],
    description :'Svenska kvinnotidningar'
};

settings.corporafolders.medeltid = {
    title : "Medeltidsbrev, Svenskt Diplomatarium",
    contents : ["sdhk-svenska"],
    description :'Svenskt Diplomatarium - från <a href="http://www.riksarkivet.se/sdhk" target="_blank">Riksarkivet</a>'
};

settings.corporafolders.runeberg = {
    title : "Runeberg",
    contents : ["runeberg-diverse", "runeberg-rost", "runeberg-svtidskr", "runeberg-urdagkron", "runeberg-tiden", "runeberg-biblblad", "runeberg-folkbbl"],
    description : "Tidskrifter från Projekt Runeberg"
};

settings.corporafolders.lag = {
    title : "Äldre lagtexter",
    contents : ["tankebok", "lag1734","forarbeten1734", "lag1800"],
    description : "Lagtexter från 1600- ,1700- och 1800-talet."
};

settings.corporafolders.bibel = {
    title : "Äldre biblar",
    contents : ["bibel1917", "bibel1873dalin", "vasabibel-nt"],
    description : "Bibeln, 1873 och 1917 års utgåvor och Gustav Vasas Bibel (nya testamentet)"
};

settings.corporafolders.fisk1800 = {
    title: "Äldre finlandssvenska",
    contents: [],
    description: ""
};

settings.corporafolders.akerbruk1700 = {
    title : "Åkerbruk och gödsel",
    contents : ["akerbruk", "kvah"],
    description : "Texter om jordbruk från 1700-talet."
};

/*
 * CORPORA SETTINGS
 */

settings.corpora['bellman'] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "bellman",
    title : "Bellmans samlade verk",
    description : "",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : {
        msd : attrs.msd,
        lemma : attrs.baseform,
        lex : attrs.lemgram,
        saldo : attrs.saldo,
        prefix : attrs.prefix,
        suffix : attrs.suffix,
        dephead : attrs.dephead,
        deprel : attrs.deprel,
        ref : attrs.ref
    },
    struct_attributes : {
        text_author : {label : "author"},
        text_title : {label : "title"},
        page_n : {label : "page"}
    }
};

settings.corpora['vasabrev'] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "vasabrev",
    title : "Gustav Vasas brevproduktion",
    description : "Konung Gustaf den förstes registratur",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : {
        msd : attrs.msd,
        lemma : attrs.baseform,
        lex : attrs.lemgram,
        dalinlex : attrs.dalinlemgram,
        saldo : attrs.saldo,
        prefix : attrs.prefix,
        suffix : attrs.suffix,
        dephead : attrs.dephead,
        deprel : attrs.deprel,
        ref : attrs.ref
    },
    struct_attributes : {
        text_title : {label : "title"},
        text_published : {label : "published"},
        text_fromyear : {label : "year_from"},
        text_toyear : {label : "year_to"}
    }
};

settings.corpora.ekeblad = {
    id : "ekeblad",
    title : "Ekeblads brev",
    description : 'Breven till Claes. Elektronisk utgåva av Sture Alléns edition 1965',
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : {
        pos : attrs.pos,
        lemma : attrs.baseform,
        lex : attrs.lemgram,
        ref : attrs.ref,
    },
    struct_attributes : {
        "text_title" : {label : "title"},
        "text_author" : {label : "author"},
        "text_date" : {label : "date"},
        "paragraph_date" : {label : "datering"}
    }
};

settings.corpora.lb = {
    id : "lb",
    title : "Litteraturbanken",
    description : 'Samtliga etexter och sökbara faksimiler från <a href="http://litteraturbanken.se/">Litteraturbanken.se</a>.',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : {
        pos : attrs.pos,
        msd : attrs.msd,
        lemma : attrs.baseform,
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
        "text_author" : {label : "author"},
        "text_url" : {label : "verk", type : "url"},
        "text_source" : {label : "source"},
        "text_date" : {label : "imprintyear"},
        "page_n" : {label : "page"},
        "page_url" : {label : "pagelink", type : "url"}
    }
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
    attributes : { lemma : settings.fsvlemma,
                lex : settings.fsvlex,
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

settings.corpora["sdhk-svenska"] = {
    id : "sdhk-svenska",
    title : "Medeltidsbrev - Svenska",
    description : settings.sdhkdescription,
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : {},
    struct_attributes : settings.sdhkstructs
};

settings.corpora["kubhist-aftonbladet-1830"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-aftonbladet-1830",
    title : "Aftonbladet 1830-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.aftonbladstruct_attributes
};

settings.corpora["kubhist-aftonbladet-1840"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-aftonbladet-1840",
    title : "Aftonbladet 1840-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.aftonbladstruct_attributes
};

settings.corpora["kubhist-aftonbladet-1850"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-aftonbladet-1850",
    title : "Aftonbladet 1850-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.aftonbladstruct_attributes
};

settings.corpora["kubhist-aftonbladet-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-aftonbladet-1860",
    title : "Aftonbladet 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.aftonbladstruct_attributes
};

settings.corpora["kubhist-blekingsposten-1850"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-blekingsposten-1850",
    title : "Blekingsposten 1850-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-blekingsposten-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-blekingsposten-1860",
    title : "Blekingsposten 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-blekingsposten-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-blekingsposten-1870",
    title : "Blekingsposten 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-blekingsposten-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-blekingsposten-1880",
    title : "Blekingsposten 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-bollnastidning-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-bollnastidning-1870",
    title : "Bollnäs tidning 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-bollnastidning-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-bollnastidning-1880",
    title : "Bollnäs tidning 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1850"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-dalpilen-1850",
    title : "Dalpilen 1850-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-dalpilen-1860",
    title : "Dalpilen 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-dalpilen-1870",
    title : "Dalpilen 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-dalpilen-1880",
    title : "Dalpilen 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1890"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-dalpilen-1890",
    title : "Dalpilen 1890-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1900"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-dalpilen-1900",
    title : "Dalpilen 1900-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1910"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-dalpilen-1910",
    title : "Dalpilen 1910-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-dalpilen-1920"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-dalpilen-1920",
    title : "Dalpilen 1920-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1780"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-fahluweckoblad-1780",
    title : "Fahlu weckoblad 1780-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1790"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-fahluweckoblad-1790",
    title : "Fahlu weckoblad 1790-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1800"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-fahluweckoblad-1800",
    title : "Fahlu weckoblad 1800-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1810"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-fahluweckoblad-1810",
    title : "Fahlu weckoblad 1810-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-fahluweckoblad-1820"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-fahluweckoblad-1820",
    title : "Fahlu weckoblad 1820-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-faluposten-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-faluposten-1860",
    title : "Faluposten 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-faluposten-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-faluposten-1870",
    title : "Faluposten 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-faluposten-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-faluposten-1880",
    title : "Faluposten 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-faluposten-1890"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-faluposten-1890",
    title : "Faluposten 1890-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-folketsrost-1850"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-folketsrost-1850",
    title : "Folkets röst 1850-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-folketsrost-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-folketsrost-1860",
    title : "Folkets röst 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-gotlandstidning-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-gotlandstidning-1860",
    title : "Gotlands tidning 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-gotlandstidning-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-gotlandstidning-1870",
    title : "Gotlands tidning 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-gotlandstidning-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-gotlandstidning-1880",
    title : "Gotlands tidning 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-goteborgsweckoblad-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-goteborgsweckoblad-1870",
    title : "Göteborgs weckoblad 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-goteborgsweckoblad-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-goteborgsweckoblad-1880",
    title : "Göteborgs weckoblad 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-goteborgsweckoblad-1890"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-goteborgsweckoblad-1890",
    title : "Göteborgs weckoblad 1890-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-gotheborgsweckolista-1740"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-gotheborgsweckolista-1740",
    title : "Götheborgs weckolista 1740-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-gotheborgsweckolista-1750"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-gotheborgsweckolista-1750",
    title : "Götheborgs weckolista 1750-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-jonkopingsbladet-1840"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-jonkopingsbladet-1840",
    title : "Jönköpingsbladet 1840-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-jonkopingsbladet-1850"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-jonkopingsbladet-1850",
    title : "Jönköpingsbladet 1850-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-jonkopingsbladet-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-jonkopingsbladet-1860",
    title : "Jönköpingsbladet 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-jonkopingsbladet-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-jonkopingsbladet-1870",
    title : "Jönköpingsbladet 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-kalmar-1860",
    title : "Kalmar 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-kalmar-1870",
    title : "Kalmar 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-kalmar-1880",
    title : "Kalmar 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1890"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-kalmar-1890",
    title : "Kalmar 1890-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1900"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-kalmar-1900",
    title : "Kalmar 1900-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-kalmar-1910"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-kalmar-1910",
    title : "Kalmar 1910-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-lindesbergsallehanda-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-lindesbergsallehanda-1870",
    title : "Lindesbergs allehanda 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-lindesbergsallehanda-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-lindesbergsallehanda-1880",
    title : "Lindesbergs allehanda 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-norraskane-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-norraskane-1880",
    title : "Norra Skåne 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-norraskane-1890"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-norraskane-1890",
    title : "Norra Skåne 1890-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1770"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1770",
    title : "Post- och Inrikes Tidningar 1770-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1780"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1780",
    title : "Post- och Inrikes Tidningar 1780-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1790"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1790",
    title : "Post- och Inrikes Tidningar 1790-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1800"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1800",
    title : "Post- och Inrikes Tidningar 1800-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1810"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1810",
    title : "Post- och Inrikes Tidningar 1810-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1820"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1820",
    title : "Post- och Inrikes Tidningar 1820-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1830"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1830",
    title : "Post- och Inrikes Tidningar 1830-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1840"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1840",
    title : "Post- och Inrikes Tidningar 1840-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1850"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1850",
    title : "Post- och Inrikes Tidningar 1850-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-postochinrikestidning-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-postochinrikestidning-1860",
    title : "Post- och Inrikes Tidningar 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1770"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-stockholmsposten-1770",
    title : "Stockholmsposten 1770-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1780"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-stockholmsposten-1780",
    title : "Stockholmsposten 1780-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1790"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-stockholmsposten-1790",
    title : "Stockholmsposten 1790-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1800"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-stockholmsposten-1800",
    title : "Stockholmsposten 1800-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1810"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-stockholmsposten-1810",
    title : "Stockholmsposten 1810-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1820"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-stockholmsposten-1820",
    title : "Stockholmsposten 1820-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-stockholmsposten-1830"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-stockholmsposten-1830",
    title : "Stockholmsposten 1830-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1840"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-tidningforwenersborg-1840",
    title : "Tidning för Wenersborgs stad och län 1840-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1850"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-tidningforwenersborg-1850",
    title : "Tidning för Wenersborgs stad och län 1850-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1860"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-tidningforwenersborg-1860",
    title : "Tidning för Wenersborgs stad och län 1860-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-tidningforwenersborg-1870",
    title : "Tidning för Wenersborgs stad och län 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-tidningforwenersborg-1880",
    title : "Tidning för Wenersborgs stad och län 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-tidningforwenersborg-1890"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-tidningforwenersborg-1890",
    title : "Tidning för Wenersborgs stad och län 1890-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-wermlandslanstidning-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-wermlandslanstidning-1870",
    title : "Wermlands läns tidning 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-wernamotidning-1870"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-wernamotidning-1870",
    title : "Wernamo tidning 1870-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-wernamotidning-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-wernamotidning-1880",
    title : "Wernamo tidning 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-ostergotlandsveckoblad-1880"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-ostergotlandsveckoblad-1880",
    title : "Östergötlands veckoblad 1880-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-ostergotlandsveckoblad-1890"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-ostergotlandsveckoblad-1890",
    title : "Östergötlands veckoblad 1890-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-ostgotaposten-1890"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-ostgotaposten-1890",
    title : "Östgötaposten 1890-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-ostgotaposten-1900"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-ostgotaposten-1900",
    title : "Östgötaposten 1900-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["kubhist-ostgotaposten-1910"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "kubhist-ostgotaposten-1910",
    title : "Östgötaposten 1910-talet",
    description : digidailydescription,
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : settings.kubhistattributes,
    struct_attributes : settings.kubhiststruct_attributes
};

settings.corpora["ub-kvt-dagny"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "ub-kvt-dagny",
    title : "Dagny",
    description : "Tidskrift för sociala och literära intressen - utgiven av Frederika-Bremer-Förbundet",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : settings.ubkvtattributes,
    struct_attributes : settings.ubkvtstruct_attributes,
};

settings.corpora["ub-kvt-hertha"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "ub-kvt-hertha",
    title : "Hertha",
    description : "Tidskrift för den svenska kvinnorörelsen - utgiven av Fredrika-Bremer-Förbundet",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : settings.ubkvtattributes,
    struct_attributes : settings.ubkvtstruct_attributes,
};

settings.corpora["ub-kvt-idun"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "ub-kvt-idun",
    title : "Idun",
    description : "Praktisk veckotidning för kvinnan och hemmet",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : settings.ubkvtattributes,
    struct_attributes : settings.ubkvtstruct_attributes,
};

settings.corpora["ub-kvt-kvt"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "ub-kvt-kvt",
    title : "Kvinnornas Tidning",
    description : "Kvinnornas Tidning",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : settings.ubkvtattributes,
    struct_attributes : settings.ubkvtstruct_attributes,
};

settings.corpora["ub-kvt-morgonbris"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "ub-kvt-morgonbris",
    title : "Morgonbris",
    description : "Arbeterskornas tidning - utgiven av kvinnornas fackförbund",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : settings.ubkvtattributes,
    struct_attributes : settings.ubkvtstruct_attributes,
};

settings.corpora["ub-kvt-rostratt"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "ub-kvt-rostratt",
    title : "Rösträtt för Kvinnor",
    description : "Tidning utgiven av landsföreningen för kvinnans politiska rösträtt",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : settings.ubkvtattributes,
    struct_attributes : settings.ubkvtstruct_attributes,
};

settings.corpora["ub-kvt-tidevarvet"] = {
    morf : 'saldom|dalinm|swedbergm',
    id : "ub-kvt-tidevarvet",
    title : "Tidevarvet",
    description : "Kvinnotidning Tidevarvet",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : settings.ubkvtattributes,
    struct_attributes : settings.ubkvtstruct_attributes,
};

settings.corpora["tankebok"] = {
    morf : 'swedbergm|dalinm',
    id : "tankebok",
    title : "Stockholms stads tänkeböcker",
    description : "Stockholms stads tänkeböcker från 1626",
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : {
        posset :  settings.posset,
        lemma : attrs.baseform,
        lex : attrs.lemgram
    },
    struct_attributes : {
        text_date : {label : "date"},
        text_title : {
            label : "title",
            displayType : "select",
            localize : false,
            dataset : [
                "Stockholms stads tänkebok - Koncept ",
                "Stockholms stads tänkebok - Notariat",
                "Stockholms stads tänkebok - Renskr "
            ],
            opts : settings.liteOptions

        },
        paragraph_marginal : {label : "paragraph_marginal"}
    }
};

settings.corpora["lag1734"] = {
    morf : 'swedbergm|dalinm',
    id : "lag1734",
    title : "1734 års lag",
    description : "Materialet utgörs av balkarna i själva lagtexten, förordet samt domarreglerna. Materialet är inskrivet för hand och korrekturläst, men en del fel finns fortfarande kvar.",
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : {
        lemma : attrs.baseform,
        lex : attrs.lemgram,
        typograph : {
            label : "typography",
            type : "set",
            displayType : "select",
            translationKey : "fab_",
            dataset : [
                "bold",
                "smallcaps",
                "headline",
                "marginal",
                "footnote",
                "italic",
                "emphasis"
            ],
            opts : settings.liteOptions

        },
    },
    struct_attributes : {
        //paragraph_marginal : {label : "paragraph_marginal"},
        text_date : {label : "date"},
        text_title : {
            label : "title",
            displayType : "select",
            localize : false,
            dataset : [
                "1734 års lag Förord",
                "1734 års lag Domareregler",
                "1734 års lag Lagtext",
            ],
            opts : settings.liteOptions
        }
    }
};

settings.corpora["forarbeten1734"] = {
    morf : 'swedbergm|dalinm',
    id : "forarbeten1734",
    title : "1734 års förarbeten",
    description : "Förarbetena till 1734 års lag utgörs av material från lagkommissionen till 1734 års lag. Materialet är från 1686–1735, utgivet av Vilhelsm Sjögren 1900–1909. Materialet utgörs av protokoll från sammanträdena (vol. 1–3); lagkommissionens förslag (vol. 4 –6); utlåtanden över lagkommissionens förslag (vol. 7) samt riksdagshandlingar angående lagkommissionens förslag (vol. 8). Materialet är OCR-skannat med manuell efterarbetning.",
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : {
        lemma : attrs.baseform,
        lex : attrs.lemgram,
        typograph : {
            label : "typography",
            type : "set",
            displayType : "select",
            translationKey : "fab_",
            dataset : [
                "bold",
                "smallcaps",
                "headline",
                "marginal",
                "footnote",
                "italic",
                "emphasis"
            ],
            opts : settings.liteOptions

        },
    },
    struct_attributes : {
        //paragraph_marginal : {label : "paragraph_marginal"},
        text_date : {label : "date"},
        text_title : {
            label : "title",
            displayType : "select",
            localize : false,
            dataset : [
                "1734 års lag Förarbeten vol 1",
                "1734 års lag Förarbeten vol 2",
                "1734 års lag Förarbeten vol 3",
                "1734 års lag Förarbeten vol 4",
                "1734 års lag Förarbeten vol 5",
                "1734 års lag Förarbeten vol 6",
                "1734 års lag Förarbeten vol 7",
                "1734 års lag Förarbeten vol 8"
            ],
            opts : settings.liteOptions
        }
    }
};

settings.corpora["lag1800"] = {
    morf : 'saldom|dalinm',
    id : "lag1800",
    title : "Lagar från 1800-talet",
    description : "Regeringsformen 1809 med ändringar 1809-1974, Författningssamling Låssa kyrkas arkiv 1800",
    within : settings.defaultWithin,
    context : settings.spContext,
    attributes : {
        posset :  settings.posset,
        lemma : attrs.baseform,
        lex : attrs.lemgram,
        saldo : attrs.saldo,
        prefix : attrs.prefix,
        suffix : attrs.suffix
    },
    struct_attributes : {
        text_title : {
            localize : false,
            label : "title",
            displayType : "select",
            dataset : [
                "Författningssamling 1800 Låssa kyrkas arkiv",
                "Regeringsformen 1809 "
            ],
            opts : settings.liteOptions

        },
        text_date : {label : "date"},
        text_marginal : {label : "paragraph_marginal"}
    }
};

settings.corpora.bibel1917 = {
    id : "bibel1917",
    title : "Bibeln 1917",
    description : "",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : {
        pos : attrs.pos,
        msd : attrs.msd,
        lemma : attrs.baseform,
        lex : attrs.lemgram,
        saldo : attrs.saldo,
        prefix : attrs.prefix,
        suffix : attrs.suffix,
        dephead : attrs.dephead,
        deprel : attrs.deprel,
        ref : attrs.ref,
    },
    struct_attributes : {
        "text_title" : {label : "title"},
        "chapter_name" : {label : "chapter"},
        "verse_name" : {label : "verse"},
        "text_date" : {label : "year"}
    }
};

settings.corpora.bibel1873dalin = {
    morf : 'saldom|dalinm|swedbergm',
    id : "bibel1873dalin",
    title : "Bibeln 1873",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : {
        pos : attrs.pos,
        msd : attrs.msd,
        lemma    : attrs.baseform,
        lex : attrs.lemgram,
        prefix : attrs.prefix,
        suffix : attrs.suffix,
        dephead : attrs.dephead,
        deprel : attrs.deprel,
        ref : attrs.ref

    },
    struct_attributes : {
        "text_title" : {label : "title"},
        "chapter_name" : {label : "chapter"},
        "verse_name" : {label : "verse"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["vasabibel-nt"] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "vasabibel-nt",
    title : "Gustaf Vasas bibel - Nya testamentet",
    description : "'Nya Testamentet i Gustaf Vasas Bibel /under jämförelse med texten av år 1526 utgivet av Natan Lindqvist' från 1941",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : {
        msd : attrs.msd,
        lemma : attrs.baseform,
        lex : attrs.lemgram,
        dalinlex : attrs.dalinlemgram,
        saldo : attrs.saldo,
        prefix : attrs.prefix,
        suffix : attrs.suffix,
        dephead : attrs.dephead,
        deprel : attrs.deprel,
        ref : attrs.ref
    },
    struct_attributes : {
        text_title : {label : "title"},
        text_publisher : {label : "publisher"},
        text_published : {label : "published"},
        text_year : {label : "year"}
    }
};

settings.corpora["runeberg-folkbbl"] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "runeberg-folkbbl",
    title : "Folkbiblioteksbladet",
    description : "",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : settings.runebergattributes,
    struct_attributes : settings.runebergstruct_attributes,

};

settings.corpora["runeberg-biblblad"] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "runeberg-biblblad",
    title : "Biblioteksbladet",
    description : "",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : settings.runebergattributes,
    struct_attributes : settings.runebergstruct_attributes,

};


settings.corpora["runeberg-diverse"] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "runeberg-diverse",
    title : "Diverse tidningar",
    description : "Brand, De ungas tidning, Det nya Sverige, Elegant, Hvar 8 dag, Nyare Conversations-Bladet, Sundsvalls tidning, Varia",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : settings.runebergattributes,
    struct_attributes : settings.runebergstruct_attributes,

};

settings.corpora["runeberg-rost"] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "runeberg-rost",
    title : "Rösträtt för kvinnor",
    description : "",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : settings.runebergattributes,
    struct_attributes : settings.runebergstruct_attributes,

};

settings.corpora["runeberg-svtidskr"] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "runeberg-svtidskr",
    title : "Svensk Tidskrift",
    description : "",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : settings.runebergattributes,
    struct_attributes : settings.runebergstruct_attributes,

};
settings.corpora["runeberg-tiden"] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "runeberg-tiden",
    title : "Tiden",
    description : "",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : settings.runebergattributes,
    struct_attributes : settings.runebergstruct_attributes,

};

settings.corpora["runeberg-urdagkron"] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "runeberg-urdagkron",
    title : "Ur Dagens Krönika",
    description : "",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : settings.runebergattributes,
    struct_attributes : settings.runebergstruct_attributes,
};

settings.corpora.kioping = {
    morf : 'swedbergm|dalinm|saldom',
    id : "kioping",
    title : "Nils Matsson Kiöpings resor",
    description : "Reseskildringar från 1674 och 1743",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : {
        msd : attrs.msd,
            lemma : attrs.baseform,
            lex : attrs.lemgram,
            saldo : attrs.saldo,
            prefix : attrs.prefix,
            suffix : attrs.suffix,
            dephead : attrs.dephead,
            deprel : attrs.deprel,
            ref : attrs.ref,
        typograph : {
            label : "typography",
            type : "set",
            displayType : "select",
            translationKey : "fab_",
            dataset : [
                "antikva",
                "smallcaps",
                "headline",
                "italic",
                "unclear",
                "gap"
                //"kustod"
            ],
            opts : settings.liteOptions
        }
    },

    struct_attributes : {
        text_date : {label : "date"},
        text_title : {
            label : "title",
            displayType : "select",
            localize : false,
            dataset : [
                "Een kort Beskriffning Uppå Trenne Reesor och Peregrinationer, sampt Konungarijket Japan",
                "BESKRIFNING Om En RESA GENOM ASIA, AFRICA Och många andra HEDNA LÄNDER "
            ],
            opts : settings.liteOptions
        },
        "chapter_name" : {label : "chapter"},
    }
};

settings.corpora['akerbruk'] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "akerbruk",
    title : "Åkerbruk",
    description : "Den Engelska åker-mannen och fåra-herden är översatt från engelska av Jacob Serenius 1727, och är en handbok i åkerbruk och fårskötsel.  En grundelig kundskap om svenska åkerbruket är skriven av Magnus Stridsberg 1727, och är en handbok om åkerbruk.",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : {
        msd : attrs.msd,
            lemma : attrs.baseform,
            lex : attrs.lemgram,
            saldo : attrs.saldo,
            prefix : attrs.prefix,
            suffix : attrs.suffix,
            dephead : attrs.dephead,
            deprel : attrs.deprel,
            ref : attrs.ref,
    },

    struct_attributes : {
        text_date : {label : "date"},
        text_title : {
            label : "title",
            displayType : "select",
            localize : false,
            dataset : [
                "Engelska Åker-Mannen.",
                "En kort beskrifning om jordförbättring med gräsfröen.",
                "En Grundelig Kundskap Om Swenska Åkerbruket / Först I Gemen."
            ],
            opts : settings.liteOptions
        },
        "chapter_name" : {label : "chapter"},
    }


};

settings.corpora['kvah'] = {
    morf : 'swedbergm|dalinm|saldom',
    id : "kvah",
    title : "KVAH",
    description : "18 artiklar från kungliga vetenskapsakademiens handlingar. Alla artiklarna handlar om åkerbruk och gödsel. De är från 1740–1778.",
    within : settings.spWithin,
    context : settings.spContext,
    attributes : {
        msd : attrs.msd,
            lemma : attrs.baseform,
            lex : attrs.lemgram,
            saldo : attrs.saldo,
            prefix : attrs.prefix,
            suffix : attrs.suffix,
            dephead : attrs.dephead,
            deprel : attrs.deprel,
            ref : attrs.ref,
    },

    struct_attributes : {
        text_date : {label : "date"},
        text_title : {
            label : "title",
            displayType : "select",
            localize : false,
            dataset : [
                "Swar på den andra frågan, i 2. Qvartalet : huruledes säden på en åker må ständigt kunna ökas til 40 kornet.",
                "Herr Inspectoren BRANDBERGS RÖN och Försök til Landtbrukets förbättrande.Framgifne Af SAM: SCHULTZE",
                "BESKRIFNING På En ny Sånings-Machine, påfunnen och til Kongl. Vetensk. Academien ingifven, Af DANIEL THUNBERG. ",
                "BESKRIFNING på Tork-Häsjor och Trösk-vagnar, som brukas i Wäster-Norrland, Ingifven af NILS GISSLER, M. D. Lector vid Hernösands Gymnasium.",
                "Tankar om Landtbrukets upodlande genom ymnig ock god Gödsels samlande i Städerna.",
                "Skolmästaren Herr ANDERS HELLSTRÖMS FÖRSÖK at förbättra Sånings-Machiner",
                "ÅKER-REDSKAP Af Järn, inrättade af H. Baron. J.BRAUNER." ,
                "Påminnelse vid sättet at göda åkrar; af JOH. J. HAARTMAN, M.D. med. Professor i Åbo, Ridd. af K. Wasa Orden.",
                "Om obrunnen gödsels förmån på åkrar, framför den som är brunnen. af PEHR WASSTRÖM",
                " BESKRIFNING På de i Norrland brukelige Trösk-vältar, af PEHR HELLZÉN, lector vid Hernösands Gymnasium.",
                "Om Sånings-Machins förbättring ock nytta",
                "Et sätt at göda och så vigare, än med Sånings Machin Af SACHAR. WESTBCK ",
                "Et ankommit Bref om Sånings- under Namn af  .",
                "Rön om Åkerbrukets nyttiga främjande medelst Utsädets och Gödslens wissa besparning. Framgifwit af SACHARIAS WESTBECK, Kyrkoherde uti Öst-Löfsta Församling i .",
                " Försök til Säds utsåning med Machine, anstälde på Fullerö Sätesgård, år 1759, Af CARL JOHAN CRONSTEDT.",
                "Om en ny påfunnen Tuf-Plog."
            ],
            opts : settings.liteOptions
        },
        "chapter_name" : {label : "chapter"},
    }
};

var fisk1800attrs = {
    pos : attrs.pos,
    msd : attrs.msd,
    lemma : attrs.baseform,
    lex : attrs.lemgram,
    saldo : attrs.saldo,
    prefix : attrs.prefix,
    suffix : attrs.suffix,
    dephead : attrs.dephead,
    deprel : attrs.deprel,
    ref : attrs.ref,
};

settings.corporafolders.fisk1800.brevdagbocker = {
    title : "Brev och dagböcker",
    contents : ["fsbbrev1700tal", "fsbbrev1800-1849", "fsbbrev1850-1899", "fsbbrev1900tal", "dagbocker1700tal", "dagbocker1800-1849", "dagbocker1900-1949"],
    description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser."
};

settings.corporafolders.fisk1800.sakprosa = {
    title : "Sakprosa",
    contents : ["sakprosa1700-1749", "sakprosa1750-1799", "sakprosa1800-1849", "sakprosa1850-1899", "sakprosa1900-1959"],
    description : "Samling av facklitteratur, reseskildringar, resebroschyrer och dissertationer m.m."
};

settings.corporafolders.fisk1800.skonlitteratur = {
    title : "Skönlitteratur",
    contents : ["fsbskonlit1800-1849", "fsbskonlit1850-1899", "fsbskonlit1900-1959"],
    description : "Material ur skönlitterära verk."
};

settings.corporafolders.fisk1800.tidningar = {
    title : "Tidningstexter",
    contents : ["bjorneborgstidning", "borgabladet2", "fredrikshamnstidning", "dagbladet1866-1886", "hbl1800", "tidningarsallskapetiabo", "uleaborgstidning", "wasabladet", "wiborgstidning", "abotidning", "aland"],
    description : "Nummer ur olika tidningar publicerade under 1700–1900-talet."
};

settings.corporafolders.fisk1800.tidskrifter = {
    title : "Tidskrifter",
    contents : [],
    description : ""
};

settings.corporafolders.fisk1800.tidskrifter.tidskrifter1849 = {
    title : "Tidskrifter 1800–1849",
    contents : ["spanskaflugan"],
    description : ""
};

settings.corporafolders.fisk1800.tidskrifter.tidskrifter1899 = {
    title : "Tidskrifter 1850–1899",
    contents : ["ateneum-1800tal", "filosofia1850-1899", "finsktidskrift1800tal", "landtmannen", "litterartidskrift-helsingfors", "typografisktminnesblad", "typograftidning"],
    description : ""
};

settings.corporafolders.fisk1800.tidskrifter.tidskrifter1959 = {
    title : "Tidskrifter 1900–1959",
    contents : ["astra1920-1959", "ateneum-1900tal", "argus", "euterpe", "filosofia1900-1959", "finsktidskrift1900tal", "husmodern"],
    description : ""
};


settings.corpora.fsbbrev1700tal = {
    id : "fsbbrev1700tal",
    title : "Brev 1700-tal",
    description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_sender" : {label : "sender"},
        "text_recipient" : {label : "text_recipient"},
        "text_title" : {label : "title"},
        "text_date" : {label : "date"},
        "text_source" : {label : "source"},
        "text_archivecode" : {label : "archivecode"}
    }
};

settings.corpora["fsbbrev1800-1849"] = {
    id : "fsbbrev1800-1849",
    title : "Brev 1800–1849",
    description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_sender" : {label : "sender"},
        "text_recipient" : {label : "text_recipient"},
        "text_title" : {label : "title"},
        "text_date" : {label : "date"},
        "text_source" : {label : "source"},
        "text_archivecode" : {label : "archivecode"}
    }
};

settings.corpora["fsbbrev1850-1899"] = {
    id : "fsbbrev1850-1899",
    title : "Brev 1850–1899",
    description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_sender" : {label : "sender"},
        "text_recipient" : {label : "text_recipient"},
        "text_title" : {label : "title"},
        "text_date" : {label : "date"},
        "text_source" : {label : "source"},
        "text_archivecode" : {label : "archivecode"}
    }
};

settings.corpora.fsbbrev1900tal = {
    id : "fsbbrev1900tal",
    title : "Brev 1900–1959",
    description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_sender" : {label : "sender"},
        "text_recipient" : {label : "text_recipient"},
        "text_title" : {label : "title"},
        "text_date" : {label : "date"},
        "text_source" : {label : "source"},
        "text_archivecode" : {label : "archivecode"}
    }
};

settings.corpora["dagbocker1700tal"] = {
    id : "dagbocker1700tal",
    title : "Dagböcker 1700-tal",
    description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_title" : {label : "title"},
        "text_location" : {label : "location"},
        "text_source" : {label : "source"},
        "text_date" : {label : "date"},
        "text_archivecode" : {label : "archivecode"}
    }
};

settings.corpora["dagbocker1800-1849"] = {
    id : "dagbocker1800-1849",
    title : "Dagböcker 1800–1849",
    description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_title" : {label : "title"},
        "text_location" : {label : "location"},
        "text_source" : {label : "source"},
        "text_date" : {label : "date"},
        "text_archivecode" : {label : "archivecode"}
    }
};

settings.corpora["dagbocker1900-1949"] = {
    id : "dagbocker1900-1949",
    title : "Dagböcker 1900–1949",
    description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_title" : {label : "title"},
        "text_location" : {label : "location"},
        "text_source" : {label : "source"},
        "text_date" : {label : "date"},
        "text_archivecode" : {label : "archivecode"}
    }
};

settings.corpora["fsbmyndighet1800tal"] = {
    id : "fsbmyndighet1800tal",
    title : "Myndighetstexter 1800-tal",
    description : "",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_source" : {label : "source"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["fsbskonlit1800-1849"] = {
    id : "fsbskonlit1800-1849",
    title : "Skönlitteratur 1800–1849",
    description : "Material ur skönlitterära verk.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["fsbskonlit1850-1899"] = {
    id : "fsbskonlit1850-1899",
    title : "Skönlitteratur 1850–1899",
    description : "Material ur skönlitterära verk.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["fsbskonlit1900-1959"] = {
    id : "fsbskonlit1900-1959",
    title : "Skönlitteratur 1900–1959",
    description : "Material ur skönlitterära verk.",
    morf : 'saldom|dalinm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_publisher" : {label : "publisher"}
    }
};

settings.corpora["ateneum-1800tal"] = {
    id : "ateneum-1800tal",
    title : "Ateneum 1898–1899",
    description : "Illustrerad tidskrift för literatur, konst och spörsmål af allmänt intresse.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_issue" : {label : "issue"}
    }
};

settings.corpora["ateneum-1900tal"] = {
    id : "ateneum-1900tal",
    title : "Ateneum 1900–1903",
    description : "Illustrerad tidskrift för literatur, konst och spörsmål af allmänt intresse.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_issue" : {label : "issue"}
    }
};

settings.corpora["filosofia1850-1899"] = {
    id : "filosofia1850-1899",
    title : "Filosofia.fi 1850–1899",
    description : "Tidskriftstexter från webbsidan filosofia.fi",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_source" : {label : "source"},
        "text_url" : {label : "url", type : "url"}
    }
};

settings.corpora["filosofia1900-1959"] = {
    id : "filosofia1900-1959",
    title : "Filosofia.fi 1900–1959",
    description : "Tidskriftstexter från webbsidan filosofia.fi",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_source" : {label : "source"},
        "text_url" : {label : "url", type : "url"}
    }
};

settings.corpora["sakprosa1700-1749"] = {
    id : "sakprosa1700-1749",
    title : "Sakprosa 1700–1749",
    description : "",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_publisher" : {label : "publisher"},
        "text_url" : {label : "url", type : "url"},
        "text_pages" : {label : "page"}
    }
};

settings.corpora["sakprosa1750-1799"] = {
    id : "sakprosa1750-1799",
    title : "Sakprosa 1750–1799",
    description : "",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_publisher" : {label : "publisher"},
        "text_url" : {label : "url", type : "url"},
        "text_pages" : {label : "page"}
    }
};

settings.corpora["sakprosa1800-1849"] = {
    id : "sakprosa1800-1849",
    title : "Sakprosa 1800–1849",
    description : "",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_publisher" : {label : "publisher"},
        "text_url" : {label : "url", type : "url"},
        "text_pages" : {label : "page"}
    }
};

settings.corpora["sakprosa1850-1899"] = {
    id : "sakprosa1850-1899",
    title : "Sakprosa 1850–1899",
    description : "",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_publisher" : {label : "publisher"},
        "text_url" : {label : "url", type : "url"},
        "text_pages" : {label : "page"}
    }
};

settings.corpora["sakprosa1900-1959"] = {
    id : "sakprosa1900-1959",
    title : "Sakprosa 1900–1959",
    description : "",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_author" : {label : "author"},
        "text_title" : {label : "title"},
        "text_date" : {label : "year"},
        "text_publisher" : {label : "publisher"},
        "text_url" : {label : "url", type : "url"},
        "text_pages" : {label : "page"}
    }
};

settings.corpora.spanskaflugan = {
    id : "spanskaflugan",
    title : "Spanska Flugan 1839–1841",
    description : "Spanska Flugan var en polemisk tidskrift, vars redaktör var J.V. Snellman.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_title" : {label : "title"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["astra1920-1959"] = {
    id : "astra1920-1959",
    title : "Astra 1920–1959",
    description : "Tidskrift med kvinnoperspektiv.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_issue" : {label : "issue"},
        "text_date" : {label : "year"}
    }
};

settings.corpora.argus = {
    id : "argus",
    title : "Argus 1907–1911",
    description : "Tidskrift för kulturella och samhälleliga frågor. Utkommer sedan 1907.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_issue" : {label : "issue"},
        "text_date" : {label : "year"}
    }
};

settings.corpora.husmodern = {
    id : "husmodern",
    title : "Husmodern 1903–1912",
    description : "Utgavs av föreningen Martha 1903–1958. Bytte sedan namn till först Marthabladet och senare Martha (1999–).",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_issue" : {label : "issue"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["landtmannen"] = {
    id : "landtmannen",
    title : "Landtmannen 1877–1879",
    description : "Notisblad för Finlands jordbruk och dess binäringar.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_issue" : {label : "issue"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["litterartidskrift-helsingfors"] = {
    id : "litterartidskrift-helsingfors",
    title : "Litterär tidskrift utgifven i Helsingfors",
    description : "Litterär tidskrift med blandat innehåll.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_issue" : {label : "issue"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["typografisktminnesblad"] = {
    id : "typografisktminnesblad",
    title : "Typografiskt minnesblad 1891",
    description : "Utkom 1642–1892.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "year"}
    }
};

settings.corpora["typograftidning"] = {
    id : "typograftidning",
    title : "Typograftidning 1889–1890",
    description : "Tidskrift ”utgifven af typografernes förening i Helsingfors”.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_issue" : {label : "issue"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["finsktidskrift1800tal"] = {
    id : "finsktidskrift1800tal",
    title : "Finsk Tidskrift 1878–1899",
    description : "Tidskrift som grundades 1875. Utkom med sitt första nummer 1876. Nordens äldsta fortsättningsvis utkommande tidskrift.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_issue" : {label : "issue"},
        "text_date" : {label : "year"}
    }
};

settings.corpora["finsktidskrift1900tal"] = {
    id : "finsktidskrift1900tal",
    title : "Finsk Tidskrift 1900–1912",
    description : "Tidskrift som grundades 1875. Utkom med sitt första nummer 1876. Nordens äldsta fortsättningsvis utkommande tidskrift.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_edition" : {label : "issue"},
        "text_date" : {label : "year"}
    }
};

settings.corpora.euterpe = {
    id : "euterpe",
    title : "Euterpe 1900–1905",
    description : "Euterpe var en litterär, konstnärlig och samhällskritisk kulturtidskrift som utkom 1900–1905. Föregångare till Argus.",
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : modernAttrs,
    struct_attributes : {
        text_date : {label : "year"},
        text_issue : {label : "issue"}
    }
};

settings.corpora["borgabladet2"] = {
    id : "borgabladet2",
    title : "Borgåbladet 1885",
    description : "Tidning som utkommer i Borgå.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["fredrikshamnstidning"] = {
    id : "fredrikshamnstidning",
    title : "Fredrikshamns Tidning 1888–1908",
    description : "Tidning som utkom i Fredrikshamn 1884–1910.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["tidningarsallskapetiabo"] = {
    id : "tidningarsallskapetiabo",
    title : "Tidningar Utgifne af et Sällskap i Åbo 1771–1783",
    description : "Finlands första tidning. Starkt knuten till Aurorasällskapet och Henrik Gabriel Porthan. Utkom i Åbo åren 1771–1778 och 1782–1785.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["uleaborgstidning"] = {
    id : "uleaborgstidning",
    title : "Uleåborgs Tidning 1877–1887",
    description : "Tidning som utkom i Uleåborg 1877–1891.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["wasabladet"] = {
    id : "wasabladet",
    title : "Wasabladet 1866–1896",
    description : "Tidning som utkommer i Vasa. Grundad år 1856.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["wiborgstidning"] = {
    id : "wiborgstidning",
    title : "Wiborgs Tidning 1867–1877",
    description : "Tidning som utkom i Viborg åren 1864–1881.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["abotidning"] = {
    id : "abotidning",
    title : "Åbo Tidning 1883–1903",
    description : "Tidning som utkom i Åbo 1882–1906.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }

};

settings.corpora["bjorneborgstidning"] = {
    id : "bjorneborgstidning",
    title : "Björneborgs Tidning 1897–1907",
    description : "Tidning som utkom i Björneborg mellan åren 1860 och 1965, med vissa avbrott.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["dagbladet1866-1886"] = {
    id : "dagbladet1866-1886",
    title : "Helsingfors Dagblad 1866–1886",
    description : "Liberal tidning som utkom i Helsingfors 1862–1889.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["hbl1800"] = {
    id : "hbl1800",
    title : "Hufvudstadsbladet 1893–1903",
    description : "Tidning som grundades av August Schauman år 1864.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora["aland"] = {
    id : "aland",
    title : "Åland 1891–1911",
    description : "Grundades 1891 av Julius Sundblom. Utkommer på Åland.",
    morf : 'saldom|dalinm|swedbergm',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : fisk1800attrs,
    struct_attributes : {
        "text_date" : {label : "date"}
    }
};

settings.corpora.spf = {
    id : "spf",
    title : "Svensk prosafiktion 1800–1900",
    description : 'Samtliga etexter från <a href="http://spf1800-1900.se/">spf1800-1900.se</a>.',
    within : settings.defaultWithin,
    context : settings.defaultContext,
    attributes : {
        pos : attrs.pos,
        msd : attrs.msd,
        lemma : attrs.baseform,
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
        "text_author" : {label : "author"},
        "text_url" : {label : "verk", type : "url"},
        "page_n" : {label : "page"},
        "text_source" : {label : "source"},
        "text_date" : {label : "imprintyear"},
        "page_url" : {label : "pagelink", type : "url"}
    }
};

settings.corpora.fragelistor = {
    id: "fragelistor",
    title: "Etnologiska frågelistor",
    description: "Nordiska museets etnologiska frågelistor",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: {
        msd: attrs.msd,
        lemma: attrs.baseform,
        lex: attrs.lemgram,
        dalinlex: attrs.dalinlemgram,
        saldo: attrs.saldo,
        prefix: attrs.prefix,
        suffix: attrs.suffix,
        dephead: attrs.dephead,
        deprel: attrs.deprel,
        ref: attrs.ref,
        ne_ex: attrs.ne_ex,
        ne_type: attrs.ne_type,
        ne_subtype: attrs.ne_subtype
    },
    struct_attributes: {
        "text_topicname": {label: "topic"},
        "text_topicid": {label: "topicid"},
        "text_year": {label: "year"},
        "text_amount_answers": {label: "amount_answers"},
        "text_author_signature": {label: "author_signature"},
        "document_id": {label: "document_id"},
        "text_source": {
            label: "source",
            displayType: "select",
            localize: false,
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: [
                "frågelistor",
                "specialfrågelistor"
            ]
        }
    }
};

// RD Riksdagens öppna data
rd_struct_attributes = {
    text_titel: {label: "title", order: 50},
    text_subtitel: {label: "rd_subtitel", order: 49},
    text_debattnamn: {label: "rd_debattnamn", order: 48},
    text_rubrik: {label: "rd_rubrik", order: 47},
    // text_rubriker: {label: "rubriker", order: 47},
    text_datum: {label: "date", order: 46},
    // text_systemdatum: {label: "systemdatum"},
    text_publicerad: {label: "published", order: 45},
    text_typ: {label: "type", order: 44},

    text_parti: {label: "party", order: 43},
    text_filnamn: {label: "rd_filnamn", order: 44},
    text_fil_url: {label: "rd_file_url", order: 43,
                   pattern: "<a href='<%= struct_attrs.text_fil_url %>' target='_blank'><%= struct_attrs.text_fil_url %></a>"},
    text_dokument_url_html: {label: "rd_dokument_url_html", order: 42,
                             pattern: "<a href='<%= struct_attrs.text_dokument_url_html %>' target='_blank'><%= struct_attrs.text_dokument_url_html %></a>"},
    text_dokument_url_text: {label: "rd_dokument_url_text", order: 41,
                             pattern: "<a href='<%= struct_attrs.text_dokument_url_text %>' target='_blank'><%= struct_attrs.text_dokument_url_text %></a>"},
    text_dokumentstatus_url_xml: {label: "rd_dokumentstatus_url_xml", order: 40,
                                  pattern: "<a href='<%= struct_attrs.text_dokumentstatus_url_xml %>' target='_blank'><%= struct_attrs.text_dokumentstatus_url_xml %></a>"},

    text_talare: {label: "speaker", order: 31},
    text_source: {label: "source", order: 30},

    text_doktyp: {label: "rd_doktyp", order: 19},
    text_dok_id: {label: "rd_dok_id", order: 18},
    text_htmlformat: {label: "rd_htmlformat", order: 17},
    text_filtyp: {label: "rd_filtyp", order: 16},
    // text_filstorlek: {label: "rd_filstorlek", order: 15},
    text_pretext: {label: "rd_pretext", order: 14},
    text_hangar_id: {label: "rd_hangar_id", order: 13},
    text_relaterat_id: {label: "rd_relaterat_id", order: 12},
    text_nummer: {label: "rd_nummer", order: 11},
    text_slutnummer: {label: "rd_slutnummer", order: 10},
    text_beteckning: {label: "rd_beteckning", order: 9},
    text_tempbeteckning: {label: "rd_tempbeteckning", order: 8},
    text_status: {label: "rd_status", order: 7},

    // text_anf_beteckning: {label: "rd_anf_beteckning", order: 0},
    // text_anf_datum: {label: "rd_anf_datum", order: 0},
    // text_anf_hangar_id: {label: "rd_anf_hangar_id", order: 0},
    // text_anf_klockslag: {label: "rd_anf_klockslag", order: 0},
    // text_anf_nummer: {label: "rd_anf_nummer", order: 0},
    // text_anf_rm: {label: "rd_anf_rm", order: 0},
    // text_anf_sekunder: {label: "rd_anf_sekunder", order: 0},
    // text_anf_text: {label: "rd_anf_text", order: 0},
    // text_anf_typ: {label: "rd_anf_typ", order: 0},
    // text_anf_video_id: {label: "rd_anf_video_id", order: 0},
    text_avsnitt: {label: "rd_avsnitt", order: 0},
    text_behandlas_i: {label: "rd_behandlas_i", order: 0},
    text_beslutstyp: {label: "rd_beslutstyp", order: 0},
    text_bet: {label: "rd_bet", order: 0},
    text_datumtid: {label: "rd_datumtid", order: 0},
    text_forslag: {label: "rd_forslag", order: 0},
    text_id: {label: "id", order: 0},
    text_intressent: {label: "rd_intressent", order: 0},
    text_intressent_id: {label: "rd_intressent_id", order: 0},
    text_kammarbeslutstyp: {label: "rd_kammarbeslutstyp", order: 0},
    text_kammaren: {label: "rd_kammaren", order: 0},
    text_kod: {label: "rd_kod", order: 0},
    text_lydelse: {label: "rd_lydelse", order: 0},
    text_lydelse2: {label: "rd_lydelse2", order: 0},
    text_motforslag_nummer: {label: "rd_motforslag_nummer", order: 0},
    text_motforslag_partier: {label: "rd_motforslag_partier", order: 0},
    text_mottagare: {label: "rd_mottagare", order: 0},
    text_namn: {label: "rd_namn", order: 0},
    text_nummer: {label: "rd_nummer", order: 0},
    text_ordning: {label: "rd_ordning", order: 0},
    text_organ: {label: "rd_organ", order: 0},
    text_partibet: {label: "rd_partibet", order: 0},
    text_partier: {label: "rd_partier", order: 0},
    text_pretext: {label: "rd_pretext", order: 0},
    text_process: {label: "rd_process", order: 0},
    text_punkt: {label: "rd_punkt", order: 0},
    // text_ref_dok_bet: {label: "rd_ref_dok_bet", order: 0},
    // text_ref_dok_id: {label: "rd_ref_dok_id", order: 0},
    // text_ref_dok_rm: {label: "rd_ref_dok_rm", order: 0},
    // text_ref_dok_subtitel: {label: "rd_ref_dok_subtitel", order: 0},
    // text_ref_dok_subtyp: {label: "rd_ref_dok_subtyp", order: 0},
    // text_ref_dok_titel: {label: "rd_ref_dok_titel", order: 0},
    // text_ref_dok_typ: {label: "rd_ref_dok_typ", order: 0},
    text_referenstyp: {label: "rd_referenstyp", order: 0},
    text_relaterat_id: {label: "rd_relaterat_id", order: 0},
    text_rm: {label: "rd_rm", order: 0},
    text_roll: {label: "rd_roll", order: 0},
    text_sourceid: {label: "rd_sourceid", order: 0},
    text_startpos: {label: "rd_startpos", order: 0},
    text_status: {label: "rd_status", order: 0},
    text_subtyp: {label: "rd_subtyp", order: 0},
    text_tumnagel: {label: "rd_tumnagel", order: 0},
    text_tumnagel_stor: {label: "rd_tumnagel_stor", order: 0},
    text_typ: {label: "rd_typ", order: 0},
    text_uppgift: {label: "rd_uppgift", order: 0},
    text_utskottet: {label: "rd_utskottet", order: 0},
    text_utskottsforslag_punkt: {label: "rd_utskottsforslag_punkt", order: 0},
    text_utskottsforslag_url_xml: {label: "rd_utskottsforslag_url_xml", order: 0,
                   pattern: "<a href='<%= struct_attrs.text_utskottsforslag_url_xml %>' target='_blank'><%= struct_attrs.text_utskottsforslag_url_xml %></a>"},
    text_video_id: {label: "rd_video_id", order: 0},
    text_video_url: {label: "rd_video_url", order: 0},
    text_vinnare: {label: "rd_vinnare", order: 0},
    text_votering_id: {label: "rd_votering_id", order: 0},
    text_votering_ledamot_url_xml: {label: "rd_votering_ledamot_url_xml", order: 0,
                   pattern: "<a href='<%= struct_attrs.text_votering_ledamot_url_xml %>' target='_blank'><%= struct_attrs.text_votering_ledamot_url_xml %></a>"},
    text_votering_sammanfattning_html: {label: "rd_votering_sammanfattning_html", order: 0},
    text_votering_url_xml: {label: "rd_votering_url_xml", order: 0,
                   pattern: "<a href='<%= struct_attrs.text_votering_url_xml %>' target='_blank'><%= struct_attrs.text_votering_url_xml %></a>"}
};

settings.corporafolders.governmental.rd = {
    title : "Riksdagens öppna data",
    contents : ["rd-bet", "rd-flista", "rd-kammakt", "rd-rskr", "rd-samtr", "rd-sou", "rd-tlista"]
};

settings.corpora["rd-bet"] = {
    id: "rd-bet",
    title: "Betänkande",
    description: "Utskottens betänkanden och utlåtanden, inklusive rksdagens beslut, en sammanfattning av voteringsresultaten och Beslut i korthet.",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};

// settings.corpora["rd-ds"] = {
//     id: "rd-ds",
//     title: "Departementsserien",
//     description: "Utredningar från regeringens departement.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

// settings.corpora["rd-eun"] = {
//     id: "rd-eun",
//     title: "EUN",
//     description: "Dokument från EU-nämnden, bland annat möteskallelser, föredragningslistor, protokoll och skriftliga samråd med regeringen.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

settings.corpora["rd-flista"] = {
    id: "rd-flista",
    title: "Föredragningslista",
    description: "Föredragningslistor för kammarens sammanträden.",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};

// settings.corpora["rd-fpm"] = {
//     id: "rd-fpm",
//     title: "Faktapromemoria",
//     description: "Regeringens faktapromemorior om EU-kommissionens förslag.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

// settings.corpora["rd-frsrdg"] = {
//     id: "rd-frsrdg",
//     title: "Framställning/redogörelse",
//     description: "Framställningar och redogörelser från organ som utsetts av riksdagen.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

// settings.corpora["rd-ip"] = {
//     id: "rd-ip",
//     title: "Interpellation",
//     description: "Interpellationer från ledamöterna till regeringen.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

settings.corpora["rd-kammakt"] = {
    id: "rd-kammakt",
    title: "Kammaraktiviteter",
    description: "",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};

// settings.corpora["rd-kom"] = {
//     id: "rd-kom",
//     title: "KOM",
//     description: "EU-kommissionens förslag och redogörelser, så kallade KOM-dokument.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

// settings.corpora["rd-mot"] = {
//     id: "rd-mot",
//     title: "Motion",
//     description: "Motioner från riksdagens ledamöter.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

// settings.corpora["rd-prop"] = {
//     id: "rd-prop",
//     title: "Proposition",
//     description: "Propositioner och skrivelser från regeringen.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

// settings.corpora["rd-prot"] = {
//     id: "rd-prot",
//     title: "Protokoll",
//     description: "Protokoll från kammarens sammanträden.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

settings.corpora["rd-rskr"] = {
    id: "rd-rskr",
    title: "Riksdagsskrivelse",
    description: "Skrivelser från riksdagen till regeringen.",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};

settings.corpora["rd-samtr"] = {
    id: "rd-samtr",
    title: "Sammanträden",
    description: "",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};

// settings.corpora["rd-skfr"] = {
//     id: "rd-skfr",
//     title: "Skriftliga frågor",
//     description: "Skriftliga frågor från ledamöterna till regeringen och svaren på dessa.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

settings.corpora["rd-sou"] = {
    id: "rd-sou",
    title: "Statens offentliga utredningar",
    description: "Olika utredningars förslag till regeringen.",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};

settings.corpora["rd-tlista"] = {
    id: "rd-tlista",
    title: "Talarlista",
    description: "Talarlistor för kammarens sammanträden.",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};

// settings.corpora["rd-utr"] = {
//     id: "rd-utr",
//     title: "Utredningar",
//     description: "Kommittédirektiv och kommittéberättelser för utredningar som regeringen tillsätter.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };
//
// settings.corpora["rd-utsk"] = {
//     id: "rd-utsk",
//     title: "Utskottsdokument",
//     description: "Dokument från utskotten, bland annat KU-anmälningar, protokoll, verksamhetsberättelser och den gamla dokumentserien Utredningar från riksdagen.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };
//
// settings.corpora["rd-yttr"] = {
//     id: "rd-yttr",
//     title: "Yttrande",
//     description: "Utskottens yttranden.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

// settings.corpora["rd-ovr"] = {
//     id: "rd-ovr",
//     title: "Övrigt",
//     description: "Dokumentserierna Riksrevisionens granskningsrapporter, Utredningar från Riksdagsförvaltningen och Rapporter från riksdagen samt planeringsdokument, bilagor till dokument och uttag ur riksdagens databaser.",
//     within: settings.defaultWithin,
//     context: settings.spContext,
//     attributes: modernAttrs2,
//     struct_attributes: rd_struct_attributes
// };

settings.corpusListing = new CorpusListing(settings.corpora);
