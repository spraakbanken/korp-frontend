window.ParallelCorpusListing = class ParallelCorpusListing extends CorpusListing {

    constructor(corpora) {
        super(corpora)

        const hash = window.location.hash.substr(2);
        for (let item of hash.split("&")) {
            var parts = item.split("=");
            if (parts[0] == "parallel_corpora") {
                this.setActiveLangs(parts[1].split(","))
                break
            }
        }
    }

    select(idArray) {
        this.selected = []
        $.each(idArray, (i, id) => {
            const corp = this.struct[id]
            this.selected = this.selected.concat(this.getLinked(corp, true, false))
        })

        this.selected = _.uniq(this.selected)
    }

    setActiveLangs(langlist) {
        this.activeLangs = langlist
    }

    getReduceLang() {
        return this.activeLangs[0]
    }

    getCurrentAttributes(lang) {
        const corpora = _.filter(this.selected, (item) => item.lang === lang)
        const struct = _.reduce(corpora, (a, b) => $.extend({}, a.attributes, b.attributes), {})
        return struct
    }

    getStructAttrs(lang) {
        const corpora = _.filter(this.selected, (item) => item.lang === lang)
        const struct = _.reduce(
            corpora,
            (a, b) => $.extend({}, a.structAttributes, b.structAttributes),
            {}
        )
        $.each(struct, (key, val) => (val["isStructAttr"] = true))

        return struct
    }

    getStructAttrsIntersection(lang) {
        const corpora = _.filter(this.selected, (item) => item.lang === lang)
        const attrs = _.map(corpora, function (corpus) {
            for (let key in corpus.structAttributes) {
                const value = corpus.structAttributes[key]
                value["isStructAttr"] = true
            }

            return corpus.structAttributes
        })
        return this._mapping_intersection(attrs)
    }

    getLinked(corp, andSelf, only_selected) {
        if (andSelf == null) {
            andSelf = false
        }
        if (only_selected == null) {
            only_selected = true
        }
        const target = only_selected ? this.selected : this.struct
        let output = _.filter(target, (item) => (corp.linkedTo || []).includes(item.id))
        if (andSelf) {
            output = [corp].concat(output)
        }
        return output
    }

    getEnabledByLang(lang, andSelf, flatten) {
        if (andSelf == null) {
            andSelf = false
        }
        if (flatten == null) {
            flatten = true
        }
        const corps = _.filter(this.selected, (item) => item["lang"] === lang)
        const output = _(corps)
            .map((item) => {
                return this.getLinked(item, andSelf)
            })
            .value()

        if (flatten) {
            return _.flatten(output)
        } else {
            return output
        }
    }

    getLinksFromLangs(activeLangs) {
        if (activeLangs.length === 1) {
            return this.getEnabledByLang(activeLangs[0], true, false)
        }
        // get the languages that are enabled given a list of active languages
        const main = _.filter(this.selected, (corp) => corp.lang === activeLangs[0])

        let output = []
        for (var lang of activeLangs.slice(1)) {
            const other = _.filter(this.selected, (corp) => corp.lang === lang)

            for (var cps of other) {
                const linked = _(main)
                    .filter((mainCorpus) => mainCorpus.linkedTo.includes(cps.id))
                    .value()

                output = output.concat(_.map(linked, (item) => [item, cps]))
            }
        }

        return output
    }

    getAttributeQuery(attr) {
        // gets the within and context queries

        const struct = this.getLinksFromLangs(this.activeLangs)
        const output = []
        $.each(struct, function (i, corps) {
            const mainId = corps[0].id.toUpperCase()
            const mainIsPivot = !!corps[0].pivot

            const other = corps.slice(1)

            const pair = _.map(other, function (corp) {
                let a
                if (mainIsPivot) {
                    a = _.keys(corp[attr])[0]
                } else {
                    a = _.keys(corps[0][attr])[0]
                }
                return mainId + "|" + corp.id.toUpperCase() + ":" + a
            })
            return output.push(pair)
        })

        return output.join(",")
    }

    getContextQueryString() {
        return this.getAttributeQuery("context")
    }

    getWithinParameters() {
        const defaultWithin = locationSearch().within || _.keys(settings.defaultWithin)[0]
        const within = this.getAttributeQuery("within")
        return { default_within: defaultWithin, within }
    }

    stringifySelected(onlyMain) {
        let struct = this.getLinksFromLangs(this.activeLangs)
        if (onlyMain) {
            struct = _.map(struct, (pair) => {
                return _.filter(pair, (item) => {
                    return item.lang === this.activeLangs[0]
                })
            })

            return _.map(_.flatten(struct), "id")
                .map((a) => a.toUpperCase())
                .join(",")
        }

        const output = []
        // $.each(struct, function(i, item) {
        for (let i = 0; i < struct.length; i++) {
            const item = struct[i]
            var main = item[0]

            const pair = _.map(
                item.slice(1),
                (corp) => main.id.toUpperCase() + "|" + corp.id.toUpperCase()
            )

            output.push(pair)
        }
        return output.join(",")
    }

    get(corpusID) {
        return this.struct[corpusID.split("|")[1]]
    }

    getTitle(corpusID) {
        return this.struct[corpusID.split("|")[1]].title
    }
}
