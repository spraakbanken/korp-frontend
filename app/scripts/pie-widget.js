pie_widget =
    options:
        container_id: ""
        data_items: ""
        diameter: 300
        sort_desc: true
        offset_x: 0
        offset_y: 0

    shapes: []
    canvas: null
    _create: ->
        @shapes = @initDiagram(@options.data_items)

    resizeDiagram: (newDiameter) ->
        if newDiameter >= 150
            $(@container_id).width newDiameter + 60
            $(@container_id).height newDiameter + 60
            @options.diameter = newDiameter
            @newData @options.data_items, false

    newData: (data_items) ->
        @canvas.remove()
        @options.data_items = data_items
        @shapes = @initDiagram(data_items)

    _constructSVGPath: (highlight, circleTrack, continueArc, offsetX, offsetY, radius, part) ->
        str = "M" + (offsetX + radius) + "," + (offsetY + radius)
        if part is 1.0 # Special case, make two arc halves
            str += "\nm -" + radius + ", 0\n"
            str += "a " + radius + "," + radius + " 0 1,0 " + radius * 2 + ",0"
            str += "a " + radius + "," + radius + " 0 1,0 -" + radius * 2 + ",0"
            str += " Z"
            str
        else
            radians = (part + circleTrack["accumulatedArc"]) * 2 * Math.PI
            str += " L"
            if continueArc
                lineToArcX = circleTrack["lastArcX"]
                lineToArcY = circleTrack["lastArcY"]
            else
                lineToArcX = offsetX + radius
                lineToArcY = offsetY
            if highlight # make piece stand out
                degree = Math.acos((lineToArcY - offsetY - radius) / radius)
                if lineToArcX - offsetX - radius < 0
                    newX = (radius * 1.1) * Math.sin(degree)
                    newY = (radius * 1.1) * Math.cos(degree)
                else
                    newX = -(radius * 1.1) * Math.sin(degree)
                    newY = (radius * 1.1) * Math.cos(degree)
                lineToArcX = offsetX + radius - newX
                lineToArcY = offsetY + radius + newY
            str += (lineToArcX) + "," + (lineToArcY)
            if highlight
                str += " A" + radius * 1.1 + "," + radius * 1.1
            else
                str += " A" + radius + "," + radius
            str += " 0 "
            if part > 0.5 # Makes the arc always go the long way instead of taking a shortcut
                str += "1"
            else
                str += "0"
            str += ",1 "
            x2 = offsetX + radius + Math.sin(radians) * radius
            y2 = offsetY + radius - Math.cos(radians) * radius
            unless highlight
                circleTrack["lastArcX"] = x2
                circleTrack["lastArcY"] = y2
            if highlight
                endDegree = Math.acos((y2 - offsetY - radius) / radius)
                if x2 < offsetX + radius
                    x2 = offsetX + radius - (radius * 1.1) * Math.sin(endDegree)
                    y2 = offsetX + radius + (radius * 1.1) * Math.cos(endDegree)
                else
                    x2 = offsetX + radius + (radius * 1.1) * Math.sin(endDegree)
                    y2 = offsetX + radius + (radius * 1.1) * Math.cos(endDegree)
            str += x2 + "," + y2
            unless highlight
                if continueArc
                    circleTrack["accumulatedArc"] += part
                else
                    circleTrack["accumulatedArc"] = part
            str += " Z"
            str

    _makeSVGPie: (pieparts, radius) ->
        nowthis = this
        mouseEnter = (event) ->
            @attr
                opacity: 0.7
                cursor: "move"
            nowthis._highlight this
            # Fire callback "enteredArc":
            callback = nowthis.options.enteredArc
            callback nowthis.eventArc(this) if $.isFunction(callback)

        mouseExit = (event) ->
            nowthis._deHighlight this
            # Fire callback "exitedArc":
            callback = nowthis.options.exitedArc
            callback nowthis.eventArc(this) if $.isFunction(callback)

        r = Raphael(@options.container_id)
        @canvas = r
        pieTrack = []
        pieTrack["accumulatedArc"] = 0
        pieTrack["lastArcX"] = 0
        pieTrack["lastArcY"] = 0
        SVGArcObjects = []
        first = true
        for fvalue in pieparts
            partOfTotal = fvalue["share"]
            unless partOfTotal is 0
                bufferPieTrack = []
                bufferPieTrack["accumulatedArc"] = pieTrack["accumulatedArc"]
                bufferPieTrack["lastArcX"] = pieTrack["lastArcX"]
                bufferPieTrack["lastArcY"] = pieTrack["lastArcY"]
                origPath = nowthis._constructSVGPath(false, pieTrack, not first, 30, 30, radius, partOfTotal)
                newPiece = r.path(origPath)
                newPieceDOMNode = newPiece.node
                newPieceDOMNode["continue"] = not first
                newPieceDOMNode["offsetX"] = 30
                newPieceDOMNode["offsetY"] = 30
                newPieceDOMNode["radius"] = radius
                newPieceDOMNode["shape_id"] = fvalue["shape_id"]
                newPieceDOMNode["caption"] = fvalue["caption"]
                newPieceDOMNode["part"] = partOfTotal
                newPieceDOMNode["track"] = bufferPieTrack
                newPieceDOMNode["origpath"] = origPath
                $(newPieceDOMNode).tooltip
                    delay: 80
                    bodyHandler: ->
                        @caption or ""

                newPiece.mouseover mouseEnter
                newPiece.mouseout mouseExit
                newPiece.click (event) ->
                    # Fire callback "clickedArc":
                    callback = nowthis.options.clickedArc
                    callback nowthis.eventArc(this) if $.isFunction(callback)

                newPiece.attr fill: fvalue["color"]
                newPiece.attr stroke: "white"
                newPiece.attr opacity: 0.7
                newPiece.attr "stroke-linejoin": "miter"
                SVGArcObjects.push newPiece
                first = false if first

        SVGArcObjects

    _sortDataDescending: (indata) ->
        sortedData = indata.slice(0)
        sortedData.sort (a, b) ->
            b["value"] - a["value"]

    initDiagram: (indata) ->
        # Creates the diagram from the data in <<data>> formatting like <<options>>, returns array of the SVG arc objects
        # <<data>> is an array with "value","id" and "caption"
        # "value" is the numeric value of the item, "id" is to connect the SVG arc item to other stuff, and "caption" is to add tooltip etc.
        defaultOptions =
            colors: [
                "90-#C0C7E0-#D0D7F0:50-#D0D7F0"
                "90-#E7C1D4-#F7D1E4:50-#F7D1E4"
                "90-#DDECC5-#EDFCD5:50-#EDFCD5"
                "90-#EFE3C8-#FFF3D8:50-#FFF3D8"
                "90-#BADED8-#CAEEE8:50-#CAEEE8"
                "90-#EFCDC8-#FFDDD8:50-#FFDDD8"
            ]

        sortedData = if @options.sort_desc then @_sortDataDescending(indata) else indata
        
        # Calculate the sum of the array
        total = 0
        for fvalue in sortedData
            total += fvalue["value"]

        # Piece of cake!
        piePieceDefinitions = []
        acc = 0
        colorCount = 0
        for fvalue in sortedData
            relative = fvalue["value"] / total
            acc += fvalue["value"]
            itemID = fvalue["shape_id"]
            itemCaption = fvalue["caption"]
            piePieceDefinitions.push
                share: relative
                color: (defaultOptions["colors"][colorCount])
                shape_id: itemID
                caption: itemCaption
            colorCount = (colorCount + 1) % defaultOptions["colors"].length
        @_makeSVGPie piePieceDefinitions, @options.diameter * 0.5

    _highlight: (item) ->
        n = item.node
        newpath = @_constructSVGPath(true, n["track"], n["continue"], n["offsetX"], n["offsetY"], n["radius"], n["part"])
        item.attr path: newpath

    _deHighlight: (item) ->
        n = item.node
        item.animate
            path: n["origpath"]
        , 400, "elastic"

    highlightArc: (itemID) ->
        for shape of @shapes
            n = @shapes[shape].node
            if n?.shape_id is itemID
                # Highlight the arc
                @_highlight @shapes[shape]
                return true

    deHighlightArc: (itemID) ->
        for shape of @shapes
            n = @shapes[shape].node
            if n?.shape_id is itemID
                # Highlight the arc
                @_deHighlight @shapes[shape]
                return true

    eventArc: (item) ->
        # Return the clicked arc's ID
        item.node["shape_id"]

$.widget "hp.pie_widget", pie_widget # create the widget