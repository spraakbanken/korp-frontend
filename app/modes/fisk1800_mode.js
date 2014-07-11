
settings.primaryColor = "#F9D4D4";
settings.primaryLight = "#F9EDED";
//settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();


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

var modernAttrs = {
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
};

settings.corpora = {};
settings.corporafolders = {};

settings.corporafolders.brevdagbocker = {
	title : "Brev och dagböcker",
	contents : ["fsbbrev1700tal", "fsbbrev1800-1849", "fsbbrev1850-1899", "fsbbrev1900tal", "dagbocker1700tal", "dagbocker1800-1849", "dagbocker1850-1899", "dagbocker1900-1949"],
	description : "Privatkorrespondens, dagböcker, resejournaler och andra icke skönlitterära texter såsom meddelanden och uppsatser."
};

settings.corporafolders.myndighet = {
	title : "Myndighetstexter",
	contents : ["fsbmyndighet1800tal"],
	description : ""
};

settings.corporafolders.sakprosa = {
	title : "Sakprosa",
	contents : ["sakprosa1700-1749", "sakprosa1750-1799", "sakprosa1800-1849", "sakprosa1850-1899", "sakprosa1900-1959"],
	description : "Samling av facklitteratur, reseskildringar, resebroschyrer och dissertationer m.m."
};

settings.corporafolders.skonlitteratur = {
	title : "Skönlitteratur",
	contents : ["fsbskonlit1800-1849", "fsbskonlit1850-1899", "fsbskonlit1900-1959"],
	description : "Material ur skönlitterära verk."
};

settings.corporafolders.tidningar = {
	title : "Tidningstexter",
	contents : ["bjorneborgstidning", "borgabladet2", "fredrikshamnstidning", "dagbladet1866-1886", "hbl1800", "tidningarsallskapetiabo", "uleaborgstidning", "wasabladet", "wiborgstidning", "abotidning", "aland"],
	description : "Nummer ur olika tidningar publicerade under 1700–1900-talet."
};

settings.corporafolders.tidskrifter = {
	title : "Tidskrifter",
	contents : [],
	description : ""
};

settings.corporafolders.tidskrifter.tidskrifter1849 = {
	title : "Tidskrifter 1800–1849",
	contents : ["spanskaflugan"],
	description : ""
};

settings.corporafolders.tidskrifter.tidskrifter1899 = {
	title : "Tidskrifter 1850–1899",
	contents : ["ateneum-1800tal", "filosofia1850-1899", "finsktidskrift1800tal", "landtmannen", "litterartidskrift-helsingfors", "typografisktminnesblad", "typograftidning"],
	description : ""
};

settings.corporafolders.tidskrifter.tidskrifter1959 = {
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

settings.corpora["dagbocker1850-1899"] = {
	id : "dagbocker1850-1899",
	title : "Dagböcker 1850–1899",
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

settings.corpusListing = new CorpusListing(settings.corpora);

