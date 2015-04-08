
settings.primaryColor = "#E0F4F4";
settings.primaryLight = "#F2FFFF";
//settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = true;
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

settings.kubhistattributes = {
	lemma : attrs.baseform,
	pos : attrs.pos,
	lex : attrs.lemgram,
	dalinlex : {
	    label : "dalin-lemgram",
	    type : "set",
	    displayType : "autocomplete",
	    opts : settings.setOptions,
	    stringify : function(lemgram) {
	        // if(_.contains(lemgram, " "))
	        // TODO: what if we're getting more than one consequtive lemgram back?
	        return util.lemgramToString(_.str.trim(lemgram), true);
	    },
	    externalSearch : karpLemgramLink,
	    internalSearch : true,
	    extended_template : "<input korp-autocomplete model='model' stringify='stringify' sorter='sorter' type='lem' >",
	    controller : function($scope) {
	        $scope.stringify = util.lemgramToString;
	        $scope.sorter = view.lemgramSort;
	    }
	},
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


digidailydescription = '<a href="http://digidaily.kb.se/">Digidaily</a> är ett utvecklingsprojekt där Riksarkivet, Kungliga biblioteket och Mittuniversitetet tillsammans ska utveckla rationella metoder och processer för digitalisering av dagstidningar.'	

$("#lemgram_list_item").remove();
$("#showLineDiagram").remove();


settings.corpora = {};
settings.corporafolders = {};

settings.corporafolders.blekingsposten = {
    title : "Blekingsposten",
    contents : ["kubhist-blekingsposten-1850", "kubhist-blekingsposten-1860", "kubhist-blekingsposten-1870", "kubhist-blekingsposten-1880"]
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

// settings.corpora["digidaily-blekingsposten"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-blekingsposten",
// 	title : "Blekingsposten",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };

settings.corporafolders.bollnastidning = {
	title : "Bollnäs tidning",
	contents : ["kubhist-bollnastidning-1870", "kubhist-bollnastidning-1880"]
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

// settings.corpora["digidaily-bollnastidning"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-bollnastidning",
// 	title : "Bollnäs tidning",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };

settings.corporafolders.dalpilen = {
	title : "Dalpilen",
	contents : ["kubhist-dalpilen-1850", "kubhist-dalpilen-1860", "kubhist-dalpilen-1870", "kubhist-dalpilen-1880", "kubhist-dalpilen-1890", "kubhist-dalpilen-1900", "kubhist-dalpilen-1910", "kubhist-dalpilen-1920"]
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

// settings.corpora["digidaily-dalpilen"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-dalpilen",
// 	title : "Dalpilen",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };


settings.corporafolders.fahluweckoblad = {
	title : "Fahlu weckoblad",
	contents : ["kubhist-fahluweckoblad-1780", "kubhist-fahluweckoblad-1790", "kubhist-fahluweckoblad-1800", "kubhist-fahluweckoblad-1810", "kubhist-fahluweckoblad-1820"]
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

// settings.corpora["digidaily-fahluweckoblad"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-fahluweckoblad",
// 	title : "Fahlu weckoblad",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };


settings.corporafolders.faluposten = {
	title : "Faluposten",
	contents : ["kubhist-faluposten-1860", "kubhist-faluposten-1870", "kubhist-faluposten-1880", "kubhist-faluposten-1890"]
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

// settings.corpora["digidaily-faluposten"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-faluposten",
// 	title : "Faluposten",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };


settings.corporafolders.folketsrost = {
	title : "Folkets röst",
	contents : ["kubhist-folketsrost-1850", "kubhist-folketsrost-1860"]
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

// settings.corpora["digidaily-folketsrost"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-folketsrost",
// 	title : "Folkets röst",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };

settings.corporafolders.gotlandstidning = {
	title : "Gotlands tidning",
	contents : ["kubhist-gotlandstidning-1860", "kubhist-gotlandstidning-1870", "kubhist-gotlandstidning-1880"]
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

// settings.corpora["digidaily-gotlandstidning"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-gotlandstidning",
// 	title : "Gotlands tidning",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };

settings.corporafolders.goteborgsweckoblad = {
	title : "Göteborgs weckoblad",
	contents : ["kubhist-goteborgsweckoblad-1870", "kubhist-goteborgsweckoblad-1880", "kubhist-goteborgsweckoblad-1890"]
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

// settings.corpora["digidaily-goteborgsweckoblad"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-goteborgsweckoblad",
// 	title : "Göteborgs weckoblad",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };

settings.corporafolders.gotheborgsweckolista = {
	title : "Götheborgs weckolista",
	contents : ["kubhist-gotheborgsweckolista-1740", "kubhist-gotheborgsweckolista-1750"]
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

// settings.corpora["digidaily-gotheborgsweckolista"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-gotheborgsweckolista",
// 	title : "Götheborgs weckolista",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };

settings.corporafolders.jonkopingsbladet = {
	title : "Jönköpingsbladet",
	contents : ["kubhist-jonkopingsbladet-1840", "kubhist-jonkopingsbladet-1850", "kubhist-jonkopingsbladet-1860", "kubhist-jonkopingsbladet-1870"]
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

// settings.corpora["digidaily-jonkopingsbladet"] = {
//     morf : 'saldom|dalinm|swedbergm',
// 	id : "digidaily-jonkopingsbladet",
// 	title : "Jönköpingsbladet",
// 	description : digidailydescription,
// 	within : settings.defaultWithin,
// 	context : settings.spContext,
// 	attributes : settings.digidailyattributes,
// 	struct_attributes : settings.digidailystruct_attributes
// };

settings.corpora["digidaily-norraskane"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-norraskane",
	title : "Norra Skåne",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-lindesbergsallehanda"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-lindesbergsallehanda",
	title : "Lindesbergs allehanda",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-postochinrikestidning"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-postochinrikestidning",
	title : "Post- och Inrikes Tidningar",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-stockholmsposten"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-stockholmsposten",
	title : "Stockholmsposten",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-kalmar"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-kalmar",
	title : "Kalmar",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-wernamotidning"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-wernamotidning",
	title : "Wernamo tidning",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-ostgotaposten"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-ostgotaposten",
	title : "Östgötaposten",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-ostergotlandsveckoblad"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-ostergotlandsveckoblad",
	title : "Östergötlands veckoblad",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-wermlandslanstidning"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-wermlandslanstidning",
	title : "Wermlands läns tidning",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};

settings.corpora["digidaily-tidningforwenersborgsstadochlan"] = {
    morf : 'saldom|dalinm|swedbergm',
	id : "digidaily-tidningforwenersborgsstadochlan",
	title : "Tidning för Wenersborgs stad och län",
	description : digidailydescription,
	within : settings.defaultWithin,
	context : settings.spContext,
	attributes : settings.digidailyattributes,
	struct_attributes : settings.digidailystruct_attributes
};


settings.corpora = _(settings.corpora)
						.sortBy("title")
						.map(function(item) {return [item.id, item]})
						.object()
						.value()

settings.corpusListing = new CorpusListing(settings.corpora);

// function getAnnotationRank(anno) {
// 	return {
// 		"word" : 1,
// 		"gf" : 2,
// 		"lemgram" : 3,
// 		"sense" : 4
// 	}[anno] || 5;
// }

