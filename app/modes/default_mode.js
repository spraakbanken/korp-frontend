var modernAttrs2 = _.extend({}, modernAttrs, {
    ne_ex: attrs.ne_ex,
    ne_type: attrs.ne_type,
    ne_subtype: attrs.ne_subtype,
    complemgram: {
        label: "complemgram",
        internalSearch: true,
        ranked: true,
        display: {
            expandList: {
                splitValue: function(value) { return value.split("+"); },
                searchKey: "lex",
                joinValues: " + ",
                stringify: function(lemgram) { return util.lemgramToString(lemgram, true); },
                linkAllValues: true
            }
        },
        type: "set",
        hideStatistics: true,
        hideExtended: true,
        hideCompare: true
    },
    compwf: {
        label: "compwf",
        display: {
            "expandList": {}
        },
        type: "set",
        hideStatistics: true,
        hideExtended: true,
        hideCompare: true
    },
    sense: {
        label: "sense",
        type: "set",
        ranked: true,
        display: {
            expandList: {
                internalSearch: function(key, value) { return "[" + key + " = '\\|" + regescape(value) + ":.*']"},
            }
        },
        stringify: function(sense) { return util.saldoToString(sense, true); },
        opts: settings.probabilitySetOptions,
        externalSearch: "https://spraakbanken.gu.se/karp/#?search=extended||and|sense|equals|<%= val %>",
        internalSearch: true,
        extended_template: settings.senseAutoComplete
    }
});
delete modernAttrs2.saldo;

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

settings.corporafolders.protected = {
    title: "Skyddade korpusar",
    contents: ["ansokningar", "sprakfragor", "coctaill", "forhor", "gdc", "mepac", "soexempel", "sw1203", "tisus", "ivip"]
};

settings.corporafolders.medical = {
    title: "Medicinska texter",
    contents: ["diabetolog", "smittskydd"]
};

settings.corporafolders.medical.ltd = {
    title: "Läkartidningen",
    contents: ["lt1996", "lt1997", "lt1998", "lt1999", "lt2000", "lt2001", "lt2002", "lt2003", "lt2004", "lt2005"]
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
 * PRESELECTED CORPORA
 * Folders will be expanded to all corpora. Optionally prefix folders with __ , which will be ignored.
 */
// TODO: this should be moved when modern texts are moved to their own mode
if(window.currentMode == "default")
settings.preselected_corpora = ["suc3", "wikipedia-sv", "talbanken", "sfs", "snp7879", "__newspapertexts", "__fisk",
                                "fof", "twitter", "__socialmedia.bloggmix", "romi", "romii", "rom99", "storsuc"];

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
        },
        w_type: {
            label: "annotation_type",
            isStructAttr: true,
            displayType: "select",
            extended_template: selectType.extended_template,
            controller: selectType.controller,
            dataset: {
                "shortened": "shortened",
                "pause": "pause",
                "overlap": "overlap"
            }
        }
    },
    struct_attributes: {
        text_country: {label: "country",
                       order: 20,
                       extended_template: selectType.extended_template,
                       controller: selectType.controller,
                       dataset: {
                           "Sverige": "Sverige",
                           "Finland": "Finland"
                       }
                   },
        text_city: {label: "city",
                    order: 19,
                    displayType: "select",
                    extended_template: selectType.extended_template,
                    controller: selectType.controller,
                    dataset: {
                        "Göteborg": "Göteborg",
                        "Helsingfors": "Helsingfors",
                        "Vasa": "Vasa",
                        "Åbo": "Åbo",
                        "Karlstad": "Karlstad"
                    }
                },
        text_place: {label: "location",
                     order: 18,
                     displayType: "select",
                     extended_template: selectType.extended_template,
                     controller: selectType.controller,
                     dataset: {
                         "GotEvent": "GotEvent",
                         "Svenska handelshögskolans bibliotek": "Svenska handelshögskolans bibliotek",
                         "Wasa teater": "Wasa teater",
                         "Åbo Svenska Teater": "Åbo Svenska Teater",
                         "Svenska teatern": "Svenska teatern",
                         "Luckan": "Luckan",
                         "Lorensbergsteatern": "Lorensbergsteatern",
                         "Stadsteatern 2": "Stadsteatern 2",
                         "Scala": "Scala",
                         "Stadsteatern 1": "Stadsteatern 1"
                     }
                 },
        text_participants: {label: "participants", order: 17},
        sentence_speaker_id: {label: "speaker",
                              hideSidebar: true,
                              displayType: "select",
                              extended_template: selectType.extended_template,
                              controller: selectType.controller,
                              dataset: {
                                  "KU1": "KU1",
                                  "PE1": "PE1",
                                  "KU2": "KU2",
                                  "pause": "pause",
                                  "PE4": "PE4",
                                  "comment": "comment",
                                  "PE2": "PE2",
                                  "PE8": "PE8",
                                  "PE5": "PE5",
                                  "PE3": "PE3",
                                  "UP1": "UP1",
                                  "UP2": "UP2",
                                  "PE": "PE",
                                  "PE10": "PE10",
                                  "PE6": "PE6",
                                  "AS2": "AS2",
                                  "AS1": "AS1",
                                  "KU3": "KU3",
                                  "PE9": "PE9"
                              }
        },
        sentence_speaker_role: {label: "speakerrole",
                                hideSidebar: true,
                                displayType: "select",
                                extended_template: selectType.extended_template,
                                controller: selectType.controller,
                                dataset: {
                                    "Kund": "Kund",
                                    "Personal": "Personal",
                                    "": "Odefinerat",
                                    "Uncertain": "Uncertain",
                                    "Assistent": "Assistent",
                                    "Talaren": "Talaren",
                                    "Kund1": "Kund1",
                                    "Kund2": "Kund2",
                                    "Hund": "Hund"
                                }
                            },
        sentence_speaker_gender: {label: "speakergender",
                                  order: 14,
                                  displayType: "select",
                                  extended_template: selectType.extended_template,
                                  controller: selectType.controller,
                                  dataset: {
                                      "female": "female",
                                      "male": "male",
                                      "": "Odefinerat"
                                  }
                              },
        sentence_speaker_age: {label: "speakerage", order: 13},
        sentence_speaker_region: {label: "speakerregion", order: 12},
        text_consentid: {label: "consentid", order: 11},
        text_type: {label: "type",
                    hideSidebar: true,
                    displayType: "select",
                    extended_template: selectType.extended_template,
                    controller: selectType.controller,
                    dataset: {
                        "service": "service"
                    }
                },
        text_date: {label: "date", order: 10},
        text_mediatype: {label: "mediatype",
                         order: 9,
                         displayType: "select",
                         extended_template: selectType.extended_template,
                         controller: selectType.controller,
                         dataset: {
                             "filmad inspelning": "filmad inspelning",
                             "telefoninspelning": "telefoninspelning"
                         }
                     },
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
                    var url = "http://k2xx.spraakdata.gu.se/korp_data/ivip/data/Testkorpus/" + path +  file + "." + ext;

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
        },
        text_speaker_custom: {
            label: "speaker",
            order: 16,
            pattern: "<span><%= struct_attrs.sentence_speaker_id %> <%= struct_attrs.sentence_speaker_role %></span>",
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
    attributes: _.extend({}, modernAttrs2, {
        name_type: {
            label: "suc_name",
            isStructAttr: true
        }
    }),
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


// RD Riksdagens öppna data
rd_struct_attributes = {
    text_titel: {label: "title", order: 50},
    text_subtitel: {label: "subtitel", order: 49},
    text_debattnamn: {label: "debattnamn", order: 48},
    text_rubrik: {label: "rubrik", order: 47},
    // text_rubriker: {label: "rubriker", order: 47},
    text_datum: {label: "date", order: 46},
    // text_systemdatum: {label: "systemdatum"},
    text_publicerad: {label: "published", order: 45},
    text_typ: {label: "type", order: 44},

    text_parti: {label: "party", order: 43},
    text_filnamn: {label: "filnamn", order: 44},
    text_fil_url: {label: "file_url", order: 43,
                   pattern: "<a href='<%= struct_attrs.text_fil_url %>' target='_blank'><%= struct_attrs.text_fil_url %></a>"},
    text_dokument_url_html: {label: "dokument_url_html", order: 42,
                             pattern: "<a href='<%= struct_attrs.text_dokument_url_html %>' target='_blank'><%= struct_attrs.text_dokument_url_html %></a>"},
    text_dokument_url_text: {label: "dokument_url_text", order: 41,
                             pattern: "<a href='<%= struct_attrs.text_dokument_url_text %>' target='_blank'><%= struct_attrs.text_dokument_url_text %></a>"},
    text_dokumentstatus_url_xml: {label: "dokumentstatus_url_xml", order: 40,
                                  pattern: "<a href='<%= struct_attrs.text_dokumentstatus_url_xml %>' target='_blank'><%= struct_attrs.text_dokumentstatus_url_xml %></a>"},

    text_talare: {label: "speaker", order: 31},
    text_source: {label: "source", order: 30},

    text_doktyp: {label: "doktyp", order: 19},
    text_dok_id: {label: "dok_id", order: 18},
    text_htmlformat: {label: "htmlformat", order: 17},
    text_filtyp: {label: "filtyp", order: 16},
    // text_filstorlek: {label: "filstorlek", order: 15},
    text_pretext: {label: "pretext", order: 14},
    text_hangar_id: {label: "hangar_id", order: 13},
    text_relaterat_id: {label: "relaterat_id", order: 12},
    text_nummer: {label: "nummer", order: 11},
    text_slutnummer: {label: "slutnummer", order: 10},
    text_beteckning: {label: "beteckning", order: 9},
    text_tempbeteckning: {label: "tempbeteckning", order: 8},
    text_status: {label: "status", order: 7},
    text_rm: {label: "rm", order: 6}

    // text_anf_beteckning: {label: "anf_beteckning", order: 0},
    // text_anf_datum: {label: "anf_datum", order: 0},
    // text_anf_hangar_id: {label: "anf_hangar_id", order: 0},
    // text_anf_klockslag: {label: "anf_klockslag", order: 0},
    // text_anf_nummer: {label: "anf_nummer", order: 0},
    // text_anf_rm: {label: "anf_rm", order: 0},
    // text_anf_sekunder: {label: "anf_sekunder", order: 0},
    // text_anf_text: {label: "anf_text", order: 0},
    // text_anf_typ: {label: "anf_typ", order: 0},
    // text_anf_video_id: {label: "anf_video_id", order: 0},
    // text_avsnitt: {label: "avsnitt", order: 0},
    // text_behandlas_i: {label: "behandlas_i", order: 0},
    // text_beslutstyp: {label: "beslutstyp", order: 0},
    // text_bet: {label: "bet", order: 0},
    // text_datumtid: {label: "datumtid", order: 0},
    // text_forslag: {label: "forslag", order: 0},
    // text_id: {label: "id", order: 0},
    // text_intressent: {label: "intressent", order: 0},
    // text_intressent_id: {label: "intressent_id", order: 0},
    // text_kammarbeslutstyp: {label: "kammarbeslutstyp", order: 0},
    // text_kammaren: {label: "kammaren", order: 0},
    // text_kod: {label: "kod", order: 0},
    // text_lydelse: {label: "lydelse", order: 0},
    // text_lydelse2: {label: "lydelse2", order: 0},
    // text_motforslag_nummer: {label: "motforslag_nummer", order: 0},
    // text_motforslag_partier: {label: "motforslag_partier", order: 0},
    // text_mottagare: {label: "mottagare", order: 0},
    // text_namn: {label: "namn", order: 0},
    // text_nummer: {label: "nummer", order: 0},
    // text_ordning: {label: "ordning", order: 0},
    // text_organ: {label: "organ", order: 0},
    // text_partibet: {label: "partibet", order: 0},
    // text_partier: {label: "partier", order: 0},
    // text_pretext: {label: "pretext", order: 0},
    // text_process: {label: "process", order: 0},
    // text_publicerad: {label: "publicerad", order: 0},
    // text_punkt: {label: "punkt", order: 0},
    // text_ref_dok_bet: {label: "ref_dok_bet", order: 0},
    // text_ref_dok_id: {label: "ref_dok_id", order: 0},
    // text_ref_dok_rm: {label: "ref_dok_rm", order: 0},
    // text_ref_dok_subtitel: {label: "ref_dok_subtitel", order: 0},
    // text_ref_dok_subtyp: {label: "ref_dok_subtyp", order: 0},
    // text_ref_dok_titel: {label: "ref_dok_titel", order: 0},
    // text_ref_dok_typ: {label: "ref_dok_typ", order: 0},
    // text_referenstyp: {label: "referenstyp", order: 0},
    // text_relaterat_id: {label: "relaterat_id", order: 0},
    // text_roll: {label: "roll", order: 0},
    // text_sourceid: {label: "sourceid", order: 0},
    // text_startpos: {label: "startpos", order: 0},
    // text_status: {label: "status", order: 0},
    // text_subtyp: {label: "subtyp", order: 0},
    // text_tumnagel: {label: "tumnagel", order: 0},
    // text_tumnagel_stor: {label: "tumnagel_stor", order: 0},
    // text_typ: {label: "typ", order: 0},
    // text_uppgift: {label: "uppgift", order: 0},
    // text_utskottet: {label: "utskottet", order: 0},
    // text_utskottsforslag_punkt: {label: "utskottsforslag_punkt", order: 0},
    // text_utskottsforslag_url_xml: {label: "utskottsforslag_url_xml", order: 0},
    // text_video_id: {label: "video_id", order: 0},
    // text_video_url: {label: "video_url", order: 0},
    // text_vinnare: {label: "vinnare", order: 0},
    // text_votering_id: {label: "votering_id", order: 0},
    // text_votering_ledamot_url_xml: {label: "votering_ledamot_url_xml", order: 0},
    // text_votering_sammanfattning_html: {label: "votering_sammanfattning_html", order: 0},
    // text_votering_url_xml: {label: "votering_url_xml", order: 0},

    // text_h4: {label: "h4", order: 0},
    // text_td: {label: "td", order: 0},
    // text_th: {label: "th", order: 0},
};


settings.corporafolders.governmental.rd = {
    title : "Riksdagens öppna data",
    contents : ["rd-flista", "rd-kammakt", "rd-rskr", "rd-samtr", "rd-sou", "rd-tlista"]
};

settings.corpora["rd-sou"] = {
    id: "rd-sou",
    title: "Statens offentliga utredningar",
    description: "Olika utredningars förslag till regeringen.",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};

settings.corpora["rd-flista"] = {
    id: "rd-flista",
    title: "Föredragningslista",
    description: "Föredragningslistor för kammarens sammanträden.",
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

settings.corpora["rd-rskr"] = {
    id: "rd-rskr",
    title: "Riksdagsskrivelse",
    description: "Skrivelser från riksdagen till regeringen.",
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

settings.corpora["rd-kammakt"] = {
    id: "rd-kammakt",
    title: "Kammaraktiviteter",
    description: "",
    within: settings.defaultWithin,
    context: settings.spContext,
    attributes: modernAttrs2,
    struct_attributes: rd_struct_attributes
};


settings.corpusListing = new CorpusListing(settings.corpora);
