/** @format */

export class CorpusListing {
    constructor(corpora) {
        this.struct = corpora
        this.corpora = _.values(corpora)
        this.selected = []
    }

    get(key) {
        return this.struct[key]
    }

    list() {
        return this.corpora
    }

    map(func) {
        return _.map(this.corpora, func)
    }

    subsetFactory(idArray) {
        // returns a new CorpusListing instance from an id subset.
        idArray = _.invokeMap(idArray, "toLowerCase")
        const cl = new CorpusListing(_.pick(this.struct, ...idArray))
        cl.selected = cl.corpora
        cl.updateAttributes()
        return cl
    }

    // only applicable for parallel corpora
    getReduceLang() {}

    // Returns an array of all the selected corpora's IDs in uppercase
    getSelectedCorpora() {
        return _.map(this.selected, "id")
    }

    select(idArray) {
        this.selected = _.values(_.pick.apply(this, [this.struct].concat(idArray)))

        this.updateAttributes()
    }

    mapSelectedCorpora(f) {
        return _.map(this.selected, f)
    }

    // takes an array of mapping objs and returns their intersection
    _mapping_intersection(mappingArray) {
        return _.reduce(
            mappingArray,
            function (a, b) {
                const keys_intersect = _.intersection(_.keys(a), _.keys(b))
                const to_mergea = _.pick(a, ...keys_intersect)
                const to_mergeb = _.pick(b, ...keys_intersect)
                return _.merge({}, to_mergea, to_mergeb)
            } || {}
        )
    }

    _mapping_union(mappingArray) {
        return _.reduce(mappingArray, (a, b) => _.merge(a, b), {})
    }

    getCurrentAttributes(lang) {
        // lang not used here, only in parallel mode
        const attrs = this.mapSelectedCorpora((corpus) => corpus.attributes)
        return this._invalidateAttrs(attrs)
    }

    getCurrentAttributesIntersection() {
        const attrs = this.mapSelectedCorpora((corpus) => corpus.attributes)

        return this._mapping_intersection(attrs)
    }

    getStructAttrsIntersection() {
        const attrs = this.mapSelectedCorpora(function (corpus) {
            for (let key in corpus["struct_attributes"]) {
                const value = corpus["struct_attributes"][key]
                value["is_struct_attr"] = true
            }

            return corpus["struct_attributes"]
        })
        return this._mapping_intersection(attrs)
    }

    getStructAttrs() {
        return this.structAttributes
    }

    _getStructAttrs() {
        const attrs = this.mapSelectedCorpora(function (corpus) {
            for (let key in corpus["struct_attributes"]) {
                const value = corpus["struct_attributes"][key]
                value["is_struct_attr"] = true
            }

            // if a position attribute is declared as structural, include here
            const pos_attrs = _.pickBy(corpus.attributes, (val, key) => {
                return val["is_struct_attr"]
            })
            return _.extend({}, pos_attrs, corpus["struct_attributes"])
        })
        const rest = this._invalidateAttrs(attrs)

        // TODO this code merges datasets from attributes with the same name and
        // should be moved to the code for extended controller "datasetSelect"
        const withDataset = _.filter(_.toPairs(rest), (item) => item[1].dataset)
        $.each(withDataset, function (i, item) {
            const key = item[0]
            const val = item[1]
            return $.each(attrs, function (j, origStruct) {
                if (origStruct[key] && origStruct[key].dataset) {
                    let ds = origStruct[key].dataset
                    if ($.isArray(ds)) {
                        ds = _.zipObject(ds, ds)
                    }

                    if (_.isArray(val.dataset)) {
                        val.dataset = _.zipObject(val.dataset, val.dataset)
                    }
                    return $.extend(val.dataset, ds)
                }
            })
        })

        return $.extend(rest, _.fromPairs(withDataset))
    }
    // End TODO

    getDefaultFilters() {
        const attrs = {}

        for (let corpus of this.selected) {
            for (let filter of corpus["attribute_filters"] || []) {
                if (!(filter in attrs)) {
                    attrs[filter] = {
                        settings: corpus["struct_attributes"][filter],
                        corpora: [corpus.id],
                    }
                } else {
                    attrs[filter].corpora.push(corpus.id)
                }
            }
        }

        const corpusCount = this.selected.length
        for (let attr of Object.keys(attrs)) {
            if (attrs[attr].corpora.length !== corpusCount) {
                delete attrs[attr]
            }
        }
        return attrs
    }

    _invalidateAttrs(attrs) {
        const union = this._mapping_union(attrs)
        const intersection = this._mapping_intersection(attrs)
        $.each(union, function (key, value) {
            if (intersection[key] == null) {
                value["disabled"] = true
            } else {
                return delete value["disabled"]
            }
        })

        return union
    }

    // returns true if coprus has all attrs, else false
    corpusHasAttrs(corpus, attrs) {
        for (let attr of attrs) {
            if (
                attr !== "word" &&
                !(attr in $.extend({}, this.struct[corpus].attributes, this.struct[corpus]["struct_attributes"]))
            ) {
                return false
            }
        }
        return true
    }

    stringifySelected() {
        return _.map(this.selected, "id")
            .map((a) => a.toUpperCase())
            .join(",")
    }

    stringifyAll() {
        return _.map(this.corpora, "id")
            .map((a) => a.toUpperCase())
            .join(",")
    }

    getWithinKeys() {
        const struct = _.map(this.selected, (corpus) => _.keys(corpus.within))
        return _.union(...(struct || []))
    }

    getContextQueryStringFromCorpusId(corpus_ids, prefer, avoid) {
        const corpora = _.map(corpus_ids, (corpus_id) => settings.corpora[corpus_id.toLowerCase()])
        return this.getContextQueryStringFromCorpora(_.compact(corpora), prefer, avoid)
    }

    getContextQueryString(prefer, avoid) {
        return this.getContextQueryStringFromCorpora(this.selected, prefer, avoid)
    }

    getContextQueryStringFromCorpora(corpora, prefer, avoid) {
        const output = []
        for (let corpus of corpora) {
            const contexts = _.keys(corpus.context)
            if (!contexts.includes(prefer)) {
                if (contexts.length > 1 && contexts.includes(avoid)) {
                    contexts.splice(contexts.indexOf(avoid), 1)
                }
                output.push(corpus.id.toUpperCase() + ":" + contexts[0])
            }
        }
        return _(output).compact().join()
    }

    getWithinParameters() {
        const defaultWithin = locationSearch().within || _.keys(settings["default_within"])[0]

        const output = []
        for (let corpus of this.selected) {
            const withins = _.keys(corpus.within)
            if (!withins.includes(defaultWithin)) {
                output.push(corpus.id.toUpperCase() + ":" + withins[0])
            }
        }
        const within = _(output).compact().join()
        return { default_within: defaultWithin, within }
    }

    getCommonWithins() {
        // only return withins that are available in every selected corpus
        const allWithins = this.selected.map((corp) => corp.within)
        const withins = allWithins.reduce(
            (acc, curr) => {
                for (const key in acc) {
                    if (!curr[key]) {
                        delete acc[key]
                    }
                }
                return acc
            },
            _.pickBy(allWithins[0], (val, within) => {
                // ignore withins that start with numbers, such as "5 sentence"
                return !within.match(/^[0-9]/)
            })
        )
        if (_.isEmpty(withins)) {
            return { sentence: "sentence" }
        }
        return withins
    }

    getTimeInterval() {
        const all = _(this.selected)
            .map("time")
            .filter((item) => item != null)
            .map(_.keys)
            .flatten()
            .map(Number)
            .sort((a, b) => a - b)
            .value()

        return [_.first(all), _.last(all)]
    }

    getMomentInterval() {
        let from, to
        const toUnix = (item) => item.unix()

        const infoGetter = (prop) => {
            return _(this.selected)
                .map("info")
                .map(prop)
                .compact()
                .map((item) => moment(item))
                .value()
        }

        const froms = infoGetter("FirstDate")
        const tos = infoGetter("LastDate")

        if (!froms.length) {
            from = null
        } else {
            from = _.minBy(froms, toUnix)
        }
        if (!tos.length) {
            to = null
        } else {
            to = _.maxBy(tos, toUnix)
        }

        return [from, to]
    }

    getTitleObj(corpus) {
        return this.struct[corpus].title
    }

    /*
     * Avoid triggering watches etc. by only creating this object once.
     */
    getWordGroup() {
        if (!this._wordGroup) {
            this._wordGroup = {
                group: "word",
                value: "word",
                label: settings["word_label"],
            }
        }
        return this._wordGroup
    }

    getWordAttributeGroups(lang, setOperator) {
        let allAttrs
        if (setOperator === "union") {
            allAttrs = this.getCurrentAttributes(lang)
        } else {
            allAttrs = this.getCurrentAttributesIntersection()
        }

        const attrs = []
        for (let key in allAttrs) {
            const obj = allAttrs[key]
            if (obj["display_type"] !== "hidden") {
                attrs.push(_.extend({ group: "word_attr", value: key }, obj))
            }
        }

        return attrs
    }

    getWordAttribute(attribute, lang) {
        const attributes = this.getCurrentAttributes(lang)
        return attributes[attribute]
    }

    getStructAttributeGroups(lang, setOperator) {
        let allAttrs
        if (setOperator === "union") {
            allAttrs = this.getStructAttrs(lang)
        } else {
            allAttrs = this.getStructAttrsIntersection(lang)
        }

        const common = this.commonAttributes

        let sentAttrs = []
        const object = _.extend({}, common, allAttrs)
        for (let key in object) {
            const obj = object[key]
            if (obj["display_type"] !== "hidden") {
                sentAttrs.push(_.extend({ group: "sentence_attr", value: key }, obj))
            }
        }

        sentAttrs = _.sortBy(sentAttrs, (item) => util.getLocaleString(item.label))

        return sentAttrs
    }

    getAttributeGroups(lang) {
        const word = this.getWordGroup()
        const attrs = this.getWordAttributeGroups(lang, "union")
        const sentAttrs = this.getStructAttributeGroups(lang, "union")
        return [word].concat(attrs, sentAttrs)
    }

    getStatsAttributeGroups(lang) {
        const word = this.getWordGroup()

        const wordOp = settings["reduce_word_attribute_selector"] || "union"
        const attrs = this.getWordAttributeGroups(lang, wordOp)

        const structOp = settings["reduce_struct_attribute_selector"] || "union"
        const sentAttrs = this.getStructAttributeGroups(lang, structOp)

        return [word].concat(attrs, sentAttrs)
    }

    // update attributes so that we don't need to check them multiple times
    // currently done only for common and struct attributes, but code for
    // positional could be added here, but is tricky because parallel mode lang might be needed
    updateAttributes() {
        const common_keys = _.compact(_.flatten(_.map(this.selected, (corp) => _.keys(corp.common_attributes))))
        this.commonAttributes = _.pick(settings["common_struct_types"], ...common_keys)
        this.structAttributes = this._getStructAttrs()
    }

    isDateInterval(type) {
        if (_.isEmpty(type)) {
            return false
        }
        const attribute = type.split("_.").slice(-1)[0]
        return (
            this.commonAttributes[attribute]?.["extended_component"] == "dateInterval" ||
            this.structAttributes[attribute]?.["extended_component"] == "dateInterval"
        )
    }
}
