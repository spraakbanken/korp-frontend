import { DeptreeAttrMap } from "@/settings/config.types"
import { Token } from "@/backend/types"
import { Visualizer } from "@/../lib/brat/client/src/visualizer.js"
import "@/../lib/brat/style-vis.css"
import "@/../lib/jquery.svg.js"
import "@/../lib/jquery.svgdom.js"

// These type definitions are very incomplete and may be inaccurate.
type BratEntity = [string, string, [number, number][]]
type BratRelation = [string, string, [string, string][]]
type BratType = {
    type: string
    labels: string[]
    color?: string
    bgColor?: string
    borderColor?: string
    args?: { role: string; targets: any[] }[]
}

type HoverFunction = (attrName: string, value: string) => void

export function drawBratTree(words: Token[], to_div: string, attrMap: DeptreeAttrMap, hover_fun: HoverFunction): void {
    const entity_types: BratType[] = []
    const relation_types: BratType[] = []
    const entities: BratEntity[] = []
    const relations: BratRelation[] = []
    const added_pos: string[] = []
    const added_rel: string[] = []

    const add_word = function (word: Token, start: number, stop: number) {
        const pos: string = word[attrMap.pos]
        const ref: string = word[attrMap.ref]
        const dephead: string = word[attrMap.head]
        const deprel: string = word[attrMap.rel]
        if (!added_pos.includes(pos)) {
            added_pos.push(pos)
            entity_types.push(makeEntityFromPos(pos))
        }
        if (!added_rel.includes(deprel)) {
            added_rel.push(deprel)
            relation_types.push(makeRelationFromRel(deprel))
        }
        const entity: BratEntity = ["T" + ref, pos, [[start, stop]]]
        entities.push(entity)
        if (Number(dephead)) {
            const relation: BratRelation = [
                "R" + ref,
                deprel,
                [
                    ["parent", "T" + dephead],
                    ["child", "T" + ref],
                ],
            ]
            relations.push(relation)
        }
    }

    const text = words.map((word) => word.word).join(" ")
    let ix = 0
    for (let _i = 0; _i < words.length; _i++) {
        const word = words[_i]
        const len = word.word.length
        add_word(word, ix, ix + len)
        ix += len + 1
    }
    const collData = {
        entity_types,
        relation_types,
    }
    const docData = {
        text,
        entities,
        relations,
    }

    /** just make a dummy dispatcher to avoid changing the brat client too much */
    const dispatcher = {
        on: () => {},
        post: () => {},
    }

    const visualizer = new Visualizer(dispatcher, to_div)
    visualizer.collectionLoaded(collData)
    visualizer.renderData(docData)

    const div = $("#" + to_div)

    // Attach hover handlers to relation arcs
    div.find("g.arcs")
        .children()
        .each(function () {
            const g = $(this)
            const rel = g.find("text").data("arc-role")
            g.hover(() => hover_fun(attrMap.rel, rel))
        })

    // Attach hover handlers to part-of-speech markers
    div.find("g.span text").each(function () {
        const pos = $(this).text()
        $(this)
            .parent()
            .hover(() => hover_fun(attrMap.pos, pos))
    })
}

function colorFromChars(w: string, sat_min: number, sat_max: number, lightness: number): [string, string] {
    let v = 1.0
    let hue = 0.0
    let sat = 0.0
    const len = w.length
    let i = 0
    while (i < len) {
        v = v / 26.0
        sat += (w.charCodeAt(i) % 26) * v
        hue += (w.charCodeAt(i) % 26) * (1.0 / 26 / len)
        i++
    }
    hue = hue * 360
    sat = sat * (sat_max - sat_min) + sat_min
    const light = `hsl(${hue}, ${sat * 100}%, ${lightness * 100}%)`
    const dark = `hsl(${hue}, ${sat * 100}%, ${lightness * 100 - 50}%)`
    return [light, dark]
}

function makeEntityFromPos(p: string): BratType {
    const [bgColor, borderColor] = colorFromChars(p, 0.8, 0.95, 0.95)
    return {
        type: p,
        labels: [p],
        bgColor,
        borderColor,
    }
}

function makeRelationFromRel(r: string): BratType {
    return {
        type: r,
        labels: [r],
        color: "#000000",
        args: [
            {
                role: "parent",
                targets: [],
            },
            {
                role: "child",
                targets: [],
            },
        ],
    }
}
