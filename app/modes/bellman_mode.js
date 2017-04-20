settings.primaryColor = "#F7D1E4";
settings.primaryLight = "#FFEBF5";
settings.autocomplete = false;
settings.wordpicture = false;

settings.structAttributeSelector = "intersection"
settings.wordAttributeSelector   = "intersection"
settings.reduceWordAttributeSelector = "intersection"

$("#lemgram_list_item").remove();
$("#results-lemgram").remove();

settings.corpora = {};
settings.corporafolders = {};

settings.corpora['bellman'] = {
    morphology: 'swedbergm|dalinm|saldom',
    id: "bellman",
    title: "Bellmans samlade verk",
    description: "",
    within: spWithin,
    context: spContext,
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
		ref: attrs.ref
    },
    structAttributes: {
        text_author: {label: "author"},
        text_title: {label: "title"},
        page_n: {label: "page"}
    }
};

settings.corpusListing = new CorpusListing(settings.corpora);
