class window.CorpusListing
    constructor: (corpora) ->
        @struct = corpora
        @corpora = _.values(corpora)
        @selected = []

    get: (key) ->
        @struct[key]

    list: ->
        @corpora

    map: (func) ->
        _.map @corpora, func

    subsetFactory : (idArray) ->
        #returns a new CorpusListing instance from an id subset.
        idArray = _.invoke(idArray, "toLowerCase")
        cl = new CorpusListing _.pick @struct, idArray...
        cl.selected = cl.corpora
        return cl


    # Returns an array of all the selected corpora's IDs in uppercase
    getSelectedCorpora: ->
        corpusChooserInstance.corpusChooser "selectedItems"

    select: (idArray) ->
        @selected = _.values(_.pick.apply(this, [@struct].concat(idArray)))

    mapSelectedCorpora: (f) ->
        _.map @selected, f


    # takes an array of mapping objs and returns their intersection
    _mapping_intersection: (mappingArray) ->

        _.reduce mappingArray, ((a, b) ->
            keys_intersect = _.intersection (_.keys a), (_.keys b)
            to_mergea = _.pick a, keys_intersect...
            to_mergeb = _.pick b, keys_intersect...
            _.merge {}, to_mergea, to_mergeb
        )

    _mapping_union: (mappingArray) ->
        _.reduce mappingArray, ((a, b) ->
            _.merge a, b
        ), {}

    getCurrentAttributes: ->
        attrs = @mapSelectedCorpora((corpus) ->
            corpus.attributes
        )
        @_invalidateAttrs attrs

    getStructAttrsIntersection: () ->
        attrs = @mapSelectedCorpora((corpus) ->
            for key, value of corpus.struct_attributes
                value["isStructAttr"] = true

            corpus.struct_attributes
        )
        @_mapping_intersection attrs

    
    getStructAttrs: ->
        attrs = @mapSelectedCorpora((corpus) ->
            for key, value of corpus.struct_attributes
                value["isStructAttr"] = true

            corpus.struct_attributes
        )
        rest = @_invalidateAttrs(attrs)

        # rest = attrs

        # fix for combining dataset values
        withDataset = _.filter(_.pairs(rest), (item) ->
            item[1].dataset
        )
        $.each withDataset, (i, item) ->
            key = item[0]
            val = item[1]
            $.each attrs, (j, origStruct) ->
                if origStruct[key]?.dataset
                    ds = origStruct[key].dataset
                    ds = _.object(ds, ds) if $.isArray(ds)
                    $.extend val.dataset, ds


        $.extend rest, _.object(withDataset)

    _invalidateAttrs: (attrs) ->
        union = @_mapping_union(attrs)
        intersection = @_mapping_intersection(attrs)
        $.each union, (key, value) ->
            unless intersection[key]?
                value["disabled"] = true
            else
                delete value["disabled"]

        union

    corpusHasAttr: (corpus, attr) ->
        attr of $.extend({}, @struct[corpus].attributes, @struct[corpus].struct_attributes)

    stringifySelected: ->
        _(@selected).pluck("id").invoke("toUpperCase").join ","

    getAttrIntersection: (attr) ->
        struct = _.map(@selected, (corpus) ->
            _.keys corpus[attr]
        )
        _.intersection.apply null, struct

    getAttrUnion: (attr) ->
        struct = _.map(@selected, (corpus) ->
            _.keys corpus[attr]
        )
        _.union struct...

    getContextQueryString: ->
        $.grep($.map(_.pluck(@selected, "id"), (id) ->
            id.toUpperCase() + ":" + _.keys(settings.corpora[id].context).slice(-1)  if _.keys(settings.corpora[id].context)
        ), Boolean).join()

    getWithinQueryString: ->
        $.grep($.map(_.pluck(@selected, "id"), (id) ->
            id.toUpperCase() + ":" + _.keys(settings.corpora[id].within).slice(-1)  if _.keys(settings.corpora[id].within)
        ), Boolean).join()

    getMorphology: ->
        _(@selected).map((corpus) ->
            morf = corpus.morf or "saldom"
            morf.split "|"
        ).flatten().unique().join "|"

    getTimeInterval : ->
        all = _(@selected)
            .pluck("time")
            .filter((item) -> item?)
            .map(_.keys)
            .flatten()
            .map(Number)
            .sort((a, b) ->
                a - b
            ).value()


        return [_.first(all), _.last(all)]

    getNonProtected : () ->
        _.filter @corpora, (item) ->
            not item.limited_access
            
    
class window.ParallelCorpusListing extends CorpusListing
    constructor: (corpora) ->
        super(corpora)

    select: (idArray) ->
        @selected = []
        $.each idArray, (i, id) =>
            corp = @struct[id]
            @selected = @selected.concat(@getLinked(corp, true, false))

        @selected = _.unique @selected


    getCurrentAttributes: (lang) ->
        corpora = _.filter(@selected, (item) ->
            item.lang is lang
        )
        struct = _.reduce(corpora, (a, b) ->
            $.extend {}, a.attributes, b.attributes
        , {})
        struct

    getStructAttrs: (lang) ->
        corpora = _.filter(@selected, (item) ->
            item.lang is lang
        )
        struct = _.reduce(corpora, (a, b) ->
            $.extend {}, a.struct_attributes, b.struct_attributes
        , {})
        $.each struct, (key, val) ->
            val["isStructAttr"] = true

        struct

    getLinked : (corp, andSelf=false, only_selected=true) ->
        target = if only_selected then @selected else @struct
        output = _.filter target, (item) ->
            item.id in (corp.linked_to or [])
        output = [corp].concat output if andSelf
        output

    getEnabledByLang : (lang, andSelf=false, flatten=true) ->
        corps = _.filter @selected, (item) ->
            item["lang"] == lang
        # c.log "corps", corps
        # window.crp = corps
        output = _(corps).map((item) =>
            @getLinked item, andSelf
        ).value()

        if flatten then (_.flatten output) else output


    getLinksFromLangs : (activeLangs) ->
        if activeLangs.length == 1
            return @getEnabledByLang(activeLangs[0], true, false)
        # get the languages that are enabled given a list of active languages
        main = _.filter @selected, (corp) ->
            corp.lang == activeLangs[0]

        output = []
        for lang in activeLangs[1..]
            other = _.filter @selected, (corp) ->
                corp.lang == lang

            for cps in other
                linked = _(main).filter((mainCorpus) ->
                    cps.id in mainCorpus.linked_to
                ).value()

                output = output.concat _.map linked, (item) -> [item, cps]

        output


    getAttributeQuery : (attr) ->
      
      #gets the within and context queries
      currentLangList = _.map($(".lang_select").get(), (item) ->
        $(item).val()
      )

      struct = @getLinksFromLangs(currentLangList)
      output = []
      $.each struct, (i, corps) ->

        mainId = corps[0].id.toUpperCase()
        mainIsPivot = !!corps[0].pivot

        other = corps.slice(1)

        pair = _.map(other, (corp) ->
            if mainIsPivot
                a = _.keys(corp[attr])[0]
            else
                a = _.keys(corps[0][attr])[0]
            mainId + "|" + corp.id.toUpperCase() + ":" + a
        )
        output.push pair

      output.join ","

    getContextQueryString: ->
        @getAttributeQuery("context")

    getWithinQueryString: ->
        @getAttributeQuery("within")

settings.corpusListing = new CorpusListing(settings.corpora)


window.getScope = (ctrl) ->
    return angular.element("[ng-controller=#{ctrl}]").scope()

window.applyTo = (ctrl, f) ->
    s = getScope(ctrl)
    s.$apply f(s)
