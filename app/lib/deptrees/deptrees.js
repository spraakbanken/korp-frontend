/* eslint-disable
    no-return-assign,
    no-undef,
    standard/array-bracket-even-spacing,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// Draw the sentence in sent
//
// If hover_fun is given, then it will be invoked with arguments of the form
// { deprel: 'AA' } and { pos: 'PN' }
window.draw_deptree = function(sent, hover_fun) {

    // console.log "Drawing", sent, window

    if (hover_fun == null) { hover_fun = function() {} }
    const sent_id = "magic_secret_id"

    const deprel_div = $("<div>").attr("id", sent_id)

    $('body').empty().append(deprel_div)

    return draw_brat_tree(sent, sent_id, hover_fun)
}


window.sentence_xml_to_json = sent =>
    _.map($(sent).children(), function(word) {
        const obj = { word: word.textContent }
        _.map(["pos", "ref", "dephead", "deprel"], attr => obj[attr] = $(word).attr(attr))
        return obj
    })


// Initialise brat
$(document).ready(head.js)

const webFontURLs = [
    "lib/brat/static/fonts/Astloch-Bold.ttf",
    "lib/brat/static/fonts/PT_Sans-Caption-Web-Regular.ttf",
    "lib/brat/static/fonts/Liberation_Sans-Regular.ttf"
]

// words are from one sentence and are Strings with extra attributes
// including rel, dephead and deprel and pos
const color_from_chars = function(w, sat_min, sat_max, lightness) {
    let v = 1.0
    let hue = 0.0
    let sat = 0.0
    const len = w.length
    let i = 0

    while (i < len) {
        v = v / 26.0
        sat += ((w.charCodeAt(i)) % 26) * v
        hue += ((w.charCodeAt(i)) % 26) * (1.0 / 26 / len)
        i++
    }
    hue = hue * 360
    sat = (sat * (sat_max - sat_min)) + sat_min
    const color = $.Color({
        hue,
        saturation: sat,
        lightness
    })
    return color.toHexString(0)
}

// Makes a brat entity from a positional attribute
const make_entity_from_pos = p =>
    ({
        type: p,
        labels: [p],
        bgColor: color_from_chars(p, 0.8, 0.95, 0.95),
        borderColor: "darken"
    })


// Makes a brat relation from a dependency relation
const make_relation_from_rel = r =>
    ({
        type: r,
        labels: [r],
        color: "#000000",
        args: [{
            role: "parent",
            targets: []
        },
         {
            role: "child",
            targets: []
        }
        ]
    })


// from http://stackoverflow.com/a/1830844/165544
const isNumber = n => (!isNaN(parseFloat(n))) && isFinite(n)

// Draws a brat tree from a XML words array to a div given its id
var draw_brat_tree = function(words, to_div, hover_fun) {

    let word
    const entity_types = []
    const relation_types = []
    const entities = []
    const relations = []
    const added_pos = []
    const added_rel = []

    const add_word = function(word, start, stop) {

        // console.log "Adding word", word, start, stop

        const [pos,ref,dephead,deprel] = Array.from((["pos", "ref", "dephead", "deprel"].map((attr) => word[attr])))

        if (!_.contains(added_pos, pos)) {
            added_pos.push(pos)
            entity_types.push(make_entity_from_pos(pos))
        }

        if (!_.contains(added_rel, deprel)) {
            added_rel.push(deprel)
            relation_types.push(make_relation_from_rel(deprel))
        }

        const entity = [`T${ref}`, pos, [[start, stop]]]
        entities.push(entity)

        if (isNumber(dephead)) {
            const relation =
                [ `R${ref}`, deprel,
                 [ ["parent", `T${dephead}` ],
                   ["child", `T${ref}`]
                  ]
                ]
            return relations.push(relation)
        }
    }

    const text = ((() => {
        const result = []
        for (word of Array.from(words)) {
             result.push(word.word)
        }
        return result
    })()).join(" ")
    let ix = 0
    for (word of Array.from(words)) {
        const len = word.word.length
        add_word(word, ix, ix + len)
        ix += len + 1
    }

    const collData = {
        entity_types,
        relation_types
    }

    const docData = {
        text,
        entities,
        relations
    }

    return head.ready(function() {

        const dispatcher = Util.embed(to_div, collData, docData, webFontURLs)

        const div = $(`#${to_div}`)
        // Set up hover callbacks
        return dispatcher.on('doneRendering', function() {

            _.map(div.find("g.arcs").children(), function(g) {
                const deprel = $(g).find("text").data("arc-role")
                return $(g).hover(() => hover_fun({ deprel }))
            })

            return _.map(div.find("g.span text"), function(g) {
                const pos = $(g).text()
                return $(g).parent().hover(() => hover_fun({ pos }))
            })
        })
    })
}

