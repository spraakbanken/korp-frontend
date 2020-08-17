/** @format */
const pie_widget = {
    options: {
        container_id: "",
        data_items: "",
        diameter: 300,
        sort_desc: true,
        offset_x: 0,
        offset_y: 0,
    },

    shapes: [],
    canvas: null,
    _create() {
        this.shapes = this.initDiagram(this.options.data_items)
    },

    resizeDiagram(newDiameter) {
        if (newDiameter >= 150) {
            $(this.container_id).width(newDiameter + 60)
            $(this.container_id).height(newDiameter + 60)
            this.options.diameter = newDiameter
            this.newData(this.options.data_items, false)
        }
    },

    newData(data_items) {
        this.canvas.remove()
        this.options.data_items = data_items
        this.shapes = this.initDiagram(data_items)
    },

    _constructSVGPath(highlight, circleTrack, continueArc, offsetX, offsetY, radius, part) {
        let str = `M${offsetX + radius},${offsetY + radius}`
        if (part === 1.0) {
            // Special case, make two arc halves
            str += `\nm -${radius}, 0\n`
            str += `a ${radius},${radius} 0 1,0 ${radius * 2},0`
            str += `a ${radius},${radius} 0 1,0 -${radius * 2},0`
            str += " Z"
            return str
        } else {
            let lineToArcX, lineToArcY
            const radians = (part + circleTrack["accumulatedArc"]) * 2 * Math.PI
            str += " L"
            if (continueArc) {
                lineToArcX = circleTrack["lastArcX"]
                lineToArcY = circleTrack["lastArcY"]
            } else {
                lineToArcX = offsetX + radius
                lineToArcY = offsetY
            }
            if (highlight) {
                // make piece stand out
                let newX, newY
                const degree = Math.acos((lineToArcY - offsetY - radius) / radius)
                if (lineToArcX - offsetX - radius < 0) {
                    newX = radius * 1.1 * Math.sin(degree)
                    newY = radius * 1.1 * Math.cos(degree)
                } else {
                    newX = -(radius * 1.1) * Math.sin(degree)
                    newY = radius * 1.1 * Math.cos(degree)
                }
                lineToArcX = offsetX + radius - newX
                lineToArcY = offsetY + radius + newY
            }
            str += lineToArcX + "," + lineToArcY
            if (highlight) {
                str += ` A${radius * 1.1},${radius * 1.1}`
            } else {
                str += ` A${radius},${radius}`
            }
            str += " 0 "
            if (part > 0.5) {
                // Makes the arc always go the long way instead of taking a shortcut
                str += "1"
            } else {
                str += "0"
            }
            str += ",1 "
            let x2 = offsetX + radius + Math.sin(radians) * radius
            let y2 = offsetY + radius - Math.cos(radians) * radius
            if (!highlight) {
                circleTrack["lastArcX"] = x2
                circleTrack["lastArcY"] = y2
            }
            if (highlight) {
                const endDegree = Math.acos((y2 - offsetY - radius) / radius)
                if (x2 < offsetX + radius) {
                    x2 = offsetX + radius - radius * 1.1 * Math.sin(endDegree)
                    y2 = offsetX + radius + radius * 1.1 * Math.cos(endDegree)
                } else {
                    x2 = offsetX + radius + radius * 1.1 * Math.sin(endDegree)
                    y2 = offsetX + radius + radius * 1.1 * Math.cos(endDegree)
                }
            }
            str += x2 + "," + y2
            if (!highlight) {
                if (continueArc) {
                    circleTrack["accumulatedArc"] += part
                } else {
                    circleTrack["accumulatedArc"] = part
                }
            }
            str += " Z"
            return str
        }
    },

    _makeSVGPie(pieparts, radius) {
        const nowthis = this
        const mouseEnter = function (event) {
            this.attr({
                opacity: 0.7,
                cursor: "move",
            })
            nowthis._highlight(this)
            // Fire callback "enteredArc":
            const callback = nowthis.options.enteredArc
            if ($.isFunction(callback)) {
                callback(nowthis.eventArc(this))
            }
        }

        const mouseExit = function (event) {
            nowthis._deHighlight(this)
            // Fire callback "exitedArc":
            const callback = nowthis.options.exitedArc
            if ($.isFunction(callback)) {
                callback(nowthis.eventArc(this))
            }
        }

        const r = window.Raphael(this.options.container_id)
        this.canvas = r
        const pieTrack = []
        pieTrack["accumulatedArc"] = 0
        pieTrack["lastArcX"] = 0
        pieTrack["lastArcY"] = 0
        const SVGArcObjects = []
        let first = true
        for (let fvalue of pieparts) {
            const partOfTotal = fvalue["share"]
            if (partOfTotal !== 0) {
                const bufferPieTrack = []
                bufferPieTrack["accumulatedArc"] = pieTrack["accumulatedArc"]
                bufferPieTrack["lastArcX"] = pieTrack["lastArcX"]
                bufferPieTrack["lastArcY"] = pieTrack["lastArcY"]
                const origPath = nowthis._constructSVGPath(
                    false,
                    pieTrack,
                    !first,
                    30,
                    30,
                    radius,
                    partOfTotal
                )
                const newPiece = r.path(origPath)
                const newPieceDOMNode = newPiece.node
                newPieceDOMNode["continue"] = !first
                newPieceDOMNode["offsetX"] = 30
                newPieceDOMNode["offsetY"] = 30
                newPieceDOMNode["radius"] = radius
                newPieceDOMNode["shape_id"] = fvalue["shape_id"]
                newPieceDOMNode["caption"] = fvalue["caption"]
                newPieceDOMNode["part"] = partOfTotal
                newPieceDOMNode["track"] = bufferPieTrack
                newPieceDOMNode["origpath"] = origPath
                $(newPieceDOMNode).tooltip({
                    delay: 80,
                    bodyHandler() {
                        return this.caption || ""
                    },
                })

                newPiece.mouseover(mouseEnter)
                newPiece.mouseout(mouseExit)
                newPiece.click(function (event) {
                    // Fire callback "clickedArc":
                    const callback = nowthis.options.clickedArc
                    if ($.isFunction(callback)) {
                        callback(nowthis.eventArc(this))
                    }
                })

                newPiece.attr({ fill: fvalue["color"] })
                newPiece.attr({ stroke: "white" })
                newPiece.attr({ opacity: 0.7 })
                newPiece.attr({ "stroke-linejoin": "miter" })
                SVGArcObjects.push(newPiece)
                if (first) {
                    first = false
                }
            }
        }

        return SVGArcObjects
    },

    _sortDataDescending(indata) {
        const sortedData = indata.slice(0)
        return sortedData.sort((a, b) => b["value"] - a["value"])
    },

    initDiagram(indata) {
        // Creates the diagram from the data in <<data>> formatting like <<options>>, returns array of the SVG arc objects
        // <<data>> is an array with "value","id" and "caption"
        // "value" is the numeric value of the item, "id" is to connect the SVG arc item to other stuff, and "caption" is to add tooltip etc.
        let fvalue
        const defaultOptions = {
            colors: [
                "90-#C0C7E0-#D0D7F0:50-#D0D7F0",
                "90-#E7C1D4-#F7D1E4:50-#F7D1E4",
                "90-#DDECC5-#EDFCD5:50-#EDFCD5",
                "90-#EFE3C8-#FFF3D8:50-#FFF3D8",
                "90-#BADED8-#CAEEE8:50-#CAEEE8",
                "90-#EFCDC8-#FFDDD8:50-#FFDDD8",
            ],
        }

        const sortedData = this.options.sort_desc ? this._sortDataDescending(indata) : indata

        // Calculate the sum of the array
        let total = 0
        for (fvalue of sortedData) {
            total += fvalue["value"]
        }

        // Piece of cake!
        const piePieceDefinitions = []
        let acc = 0
        let colorCount = 0
        for (fvalue of sortedData) {
            const relative = fvalue["value"] / total
            acc += fvalue["value"]
            const itemID = fvalue["shape_id"]
            const itemCaption = fvalue["caption"]
            piePieceDefinitions.push({
                share: relative,
                color: defaultOptions["colors"][colorCount],
                shape_id: itemID,
                caption: itemCaption,
            })
            colorCount = (colorCount + 1) % defaultOptions["colors"].length
        }
        return this._makeSVGPie(piePieceDefinitions, this.options.diameter * 0.5)
    },

    _highlight(item) {
        const n = item.node
        const newpath = this._constructSVGPath(
            true,
            n["track"],
            n["continue"],
            n["offsetX"],
            n["offsetY"],
            n["radius"],
            n["part"]
        )
        return item.attr({ path: newpath })
    },

    _deHighlight(item) {
        const n = item.node
        return item.animate({ path: n["origpath"] }, 400, "elastic")
    },

    highlightArc(itemID) {
        for (let shape in this.shapes) {
            const n = this.shapes[shape].node
            if ((n && n.shape_id) === itemID) {
                // Highlight the arc
                this._highlight(this.shapes[shape])
                return true
            }
        }
    },

    deHighlightArc(itemID) {
        for (let shape in this.shapes) {
            const n = this.shapes[shape].node
            if ((n && n.shape_id) === itemID) {
                // Highlight the arc
                this._deHighlight(this.shapes[shape])
                return true
            }
        }
    },
    eventArc(item) {
        // Return the clicked arc's ID
        return item.node["shape_id"]
    },
}

let widget = require("components-jqueryui/ui/widget")
widget("hp.pie_widget", pie_widget) // create the widget
