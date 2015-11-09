settings.primaryColor = "#F7D1E4";
settings.primaryLight = "#FFEBF5";
settings.autocomplete = false;
settings.lemgramSelect = false;
settings.wordpicture = false;

settings.struct_attribute_selector = "intersection"
settings.word_attribute_selector   = "intersection" 
settings.reduce_word_attribute_selector = "intersection" 

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();
//$("#showLineDiagram").remove();

settings.corpora = {};
settings.corporafolders = {};

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
 		dalinlex : attrs.dalinlemgram,
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

settings.corpusListing = new CorpusListing(settings.corpora);

