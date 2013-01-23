
# Draw the sentence in sent
#
# If hover_fun is given, then it will be invoked with arguments of the form
# { deprel: 'AA' } and { pos: 'PN' }
window.draw_deptree = (sent, hover_fun=->) ->

    # console.log "Drawing", sent, window

    sent_id = "magic_secret_id"

    deprel_div = $("<div>").attr("id", sent_id)

    $('body').empty().append deprel_div

    draw_brat_tree sent, sent_id, hover_fun


window.sentence_xml_to_json = (sent) ->
    _.map $(sent).children(), (word) ->
        obj = word: word.textContent
        _.map ["pos", "ref", "dephead", "deprel"], (attr) ->
            obj[attr] = $(word).attr attr
        obj

# Initialise brat
$(document).ready head.js

webFontURLs = [
    "lib/brat/static/fonts/Astloch-Bold.ttf"
    "lib/brat/static/fonts/PT_Sans-Caption-Web-Regular.ttf"
    "lib/brat/static/fonts/Liberation_Sans-Regular.ttf"
]

# words are from one sentence and are Strings with extra attributes
# including rel, dephead and deprel and pos
color_from_chars = (w, sat_min, sat_max, lightness) ->
    v = 1.0
    hue = 0.0
    sat = 0.0
    len = w.length
    i = 0

    while i < len
        v = v / 26.0
        sat += ((w.charCodeAt(i)) % 26) * v
        hue += ((w.charCodeAt(i)) % 26) * (1.0 / 26 / len)
        i++
    hue = hue * 360
    sat = sat * (sat_max - sat_min) + sat_min
    color = $.Color
        hue: hue
        saturation: sat
        lightness: lightness
    color.toHexString 0

# Makes a brat entity from a positional attribute
make_entity_from_pos = (p) ->
    type: p
    labels: [p]
    bgColor: color_from_chars(p, 0.8, 0.95, 0.95)
    borderColor: "darken"

# Makes a brat relation from a dependency relation
make_relation_from_rel = (r) ->
    type: r
    labels: [r]
    color: "#000000"
    args: [
        role: "parent"
        targets: []
    ,
        role: "child"
        targets: []
    ]

# from http://stackoverflow.com/a/1830844/165544
isNumber = (n) -> (!isNaN parseFloat n) and isFinite n

# Draws a brat tree from a XML words array to a div given its id
draw_brat_tree = (words, to_div, hover_fun) ->

    entity_types = []
    relation_types = []
    entities = []
    relations = []
    added_pos = []
    added_rel = []

    add_word = (word, start, stop) ->

        # console.log "Adding word", word, start, stop

        [pos,ref,dephead,deprel] = (word[attr] for attr in ["pos", "ref", "dephead", "deprel"])

        unless _.contains added_pos, pos
            added_pos.push pos
            entity_types.push make_entity_from_pos pos

        unless _.contains added_rel, deprel
            added_rel.push deprel
            relation_types.push make_relation_from_rel deprel

        entity = ["T" + ref, pos, [[start, stop]]]
        entities.push entity

        if isNumber dephead
            relation =
                [ "R" + ref, deprel
                , [ ["parent", "T" + dephead ]
                  , ["child", "T" + ref]
                  ]
                ]
            relations.push relation

    text = (word.word for word in words).join(" ")
    ix = 0
    for word in words
        len = word.word.length
        add_word word, ix, ix + len
        ix += len + 1

    collData =
        entity_types: entity_types
        relation_types: relation_types

    docData =
        text: text
        entities: entities
        relations: relations

    head.ready ->

        dispatcher = Util.embed to_div, collData, docData, webFontURLs

        div = $("#" + to_div)
        # Set up hover callbacks
        dispatcher.on 'doneRendering', ->

            _.map div.find("g.arcs").children(), (g) ->
                deprel = $(g).find("text").data("arc-role")
                $(g).hover -> hover_fun deprel: deprel

            _.map div.find("g.span text"), (g) ->
                pos = $(g).text()
                $(g).parent().hover -> hover_fun pos: pos

