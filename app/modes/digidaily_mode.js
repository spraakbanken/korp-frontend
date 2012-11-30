
settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
//settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;
settings.digidailyattributes = {
	lemma : attrs.baseform,
	pos : attrs.pos,
	lex : attrs.lemgram,
	dephead : attrs.dephead,
	deprel : attrs.deprel,
	ref : attrs.ref,
	saldo : attrs.saldo,
	prefix : attrs.prefix,
	suffix : attrs.suffix
};
settings.digidailystruct_attributes = {
	text_title : {
		label : "title",
		displayType : "select",
		localize : false,
 		opts : settings.liteOptions
	},
	text_date : {label : "date"}
};

digidailydescription = '<a href="http://digidaily.kb.se/">Digidaily</a> är ett utvecklingsprojekt där Riksarkivet, Kungliga biblioteket och Mittuniversitetet tillsammans ska utveckla rationella metoder och processer för digitalisering av dagstidningar.'
	
$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
$("#showLineDiagram").remove();


settings.corpora = {};
settings.corporafolders = {};

settings.corpora["digidaily-dalpilen"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-dalpilen",
	title : "Dalpilen",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-goteborgsweckoblad"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-goteborgsweckoblad",
	title : "Göteborgs weckoblad",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};
	
settings.corpora["digidaily-gotlandstidning"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-gotlandstidning",
	title : "Gotlands tidning",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};


settings.corpora["digidaily-faluposten"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-faluposten",
	title : "Faluposten",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-fahluweckoblad"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-fahluweckoblad",
	title : "Fahlu weckoblad",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-jonkopingsbladet"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-jonkopingsbladet",
	title : "Jönköpingsbladet",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};


settings.corpora["digidaily-folketsrost"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-folketsrost",
	title : "Folkets röst",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-bollnastidning"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-bollnastidning",
	title : "Bollnäs tidning",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};
		

settings.corpora["digidaily-norraskane"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-norraskane",
	title : "Norra Skåne",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-lindesbergsallehanda"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-lindesbergsallehanda",
	title : "Lindesbergs allehanda",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-blekingsposten"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-blekingsposten",
	title : "Blekingsposten",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};


settings.corpora["digidaily-postochinrikestidning"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-postochinrikestidning",
	title : "Post- och Inrikes Tidningar",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-stockholmsposten"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-stockholmsposten",
	title : "Stockholmsposten",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};


settings.corpora["digidaily-kalmar"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-kalmar",
	title : "Kalmar",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-wernamotidning"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-wernamotidning",
	title : "Wernamo tidning",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-gotheborgsweckolista"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-gotheborgsweckolista",
	title : "Götheborgs weckolista",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};


settings.corpora["digidaily-ostgotaposten"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-ostgotaposten",
	title : "Östgötaposten",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-ostergotlandsveckoblad"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-ostergotlandsveckoblad",
	title : "Östergötlands veckoblad",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-wermlandslanstidning"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-wermlandslanstidning",
	title : "Wermlands läns tidning",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};

settings.corpora["digidaily-tidningforwenersborgsstadochlan"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-tidningforwenersborgsstadochlan",
	title : "Tidning för Wenersborgs stad och län",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
       
	struct_attributes : settings.digidailystruct_attributes,
};



settings.corpusListing = new CorpusListing(settings.corpora);

function getAnnotationRank(anno) {
	return {
		"word" : 1,
		"gf" : 2,
		"lemgram" : 3,
		"sense" : 4
	}[anno] || 5;
}

