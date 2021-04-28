view.KWICResults = class ParallelKwicResults extends view.KWICResults {

    selectWord(word, scope, sentence) {
        // c.log ("word, scope, sentence", word, scope, sentence)
        super.selectWord(word, scope, sentence)
        this.clearLinks()
        var self = this
        var obj = scope.wd

        if(!obj.linkref) return

        console.log("sentence.corpus", sentence.corpus, settings.corpora, settings.corpusListing.struct)
        // var corpus = settings.corpusListing.get(sentence.corpus)
        var corpus = settings.corpora[sentence.corpus]

        function findRef(ref, sentence) {
            var out = null
            _.each(sentence, function(word) {
                if(word.linkref == ref.toString()) {
                    out = word
                    return false
                }
            })
            return out
        }


        if(sentence.isLinked){ // a secondary language was clicked
            var sent_index = scope.$parent.$index
            // c.log ("sent_index", sent_index)
            var data = this.getActiveData()
            var mainSent = null
            while(data[sent_index]) {
                 var sent = data[sent_index]
                 if(!sent.isLinked) {
                     mainSent = sent
                     break
                 }
                sent_index--
            }

             // c.log( "mainSent", mainSent)
             var linkNum = Number(obj.linkref)
             var lang = corpus.id.split("-")[1]
             var mainCorpus = mainSent.corpus.split("-")[0]

            _.each(mainSent.tokens, function(token) {
                var refs = _.map(_.compact(token["wordlink-" + lang].split("|")), Number)
                if(_.includes(refs, linkNum)) {
                    token._link_selected = true
                    self.selected.push(token)
                }
            })

        } else {
            var links = _.pickBy(obj, function(val, key) {
                return _.startsWith(key, "wordlink")
            })
            _.each(links, function(val, key) {
                var wordsToLink = _.each(_.compact(val.split("|")), function(num) {
                    var lang = key.split("-")[1]
                    var mainCorpus = corpus.id.split("-")[0]

                    var link = findRef(num, sentence.aligned[mainCorpus + "-" + lang])
                    link._link_selected = true
                    self.selected.push(link)

                })
            })

        }
        safeApply(scope, $.noop)

    }

    clearLinks() {
        _.each(this.selected, function(word) {
            delete word._link_selected
        })
        this.selected = []
    }
}