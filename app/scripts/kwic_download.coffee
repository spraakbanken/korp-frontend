
korpApp = angular.module("korpApp")
korpApp.factory "kwicDownload", () ->

    emptyRow = (length) ->
        a = new Array(length)
        for x in [0..a.length-1]
            a[x] = ""
        return a

    createFile = (dataType, fileType, content) ->
        date = moment().format("YYYYDDMM_HHmmss")
        filename = "korp_" + dataType + "_" + date + "." + fileType
        blobURL = window.URL.createObjectURL new Blob([content], {type: "text/" + fileType})
        return [filename, blobURL]

    padRows = (data, length) ->
        return _.map data, (row) ->
            newRow = emptyRow length
            newRow[0] = row
            newRow

    createSearchInfo = (requestInfo, totalHits) ->
        rows = []
        fields = ["cqp", "context", "within", "sorting", "start", "end", "hits"]
        for field in fields
            if field == "cqp"
                row = "## CQP query: " + requestInfo.cqp
            if field == "context"
                row = "## context: " + requestInfo.default_context
            if field == "within"
                row = "## within: " + requestInfo.default_within
            if field == "sorting"
                sorting = requestInfo.sort or "none"
                row = "## sorting: " + sorting
            if field == "start"
                row = "## start: " + requestInfo.start
            if field == "end"
                cqpQuery = ""
                row = "## end: " + requestInfo.end
            if field == "hits"
                row = "## Total hits: " + totalHits
            rows.push row
        return rows

    transformDataToAnnotations = (data, searchInfo) ->
        headers = _.filter(_.keys(data[1].tokens[0]),(val) -> val.indexOf("_") isnt 0 and val isnt "structs" and val isnt "$$hashKey" and val isnt "position")
        columnCount = headers.length + 1
        res = padRows searchInfo, columnCount
        res.push ["match"].concat headers 
        for row in data
            if row.tokens
                textAttributes = []
                for attrName  of row.structs
                    attrValue = row.structs[attrName]
                    textAttributes.push (attrName + ": \"" + attrValue + "\"")
                hitInfo = emptyRow columnCount
                hitInfo[0] = "# " + corpus + "; text attributes: " + textAttributes.join(", ")
                res.push hitInfo
                
                for token in row.tokens or []
                    if (token.position >= row.match.start) and (token.position < row.match.end)
                        match = "***"
                    else
                        match = ""
                    newRow = [match]
                    for field in headers
                        newRow.push token[field]
                    res.push newRow
            else if row.newCorpus
                corpus = row.newCorpus
        
        return res

    transformDataToKWIC = (data, searchInfo) ->
        structHeaders = []
        res = []
        for row in data
            if row.tokens

                leftContext = []
                for token in row.tokens.slice 0, row.match.start
                    leftContext.push token.word
                match = []
                for token in row.tokens.slice row.match.start, row.match.end
                    match.push token.word
                rightContext = []
                for token in row.tokens.slice row.match.end, row.tokens.length
                    rightContext.push token.word
                
                structs = []
                for attrName  of row.structs
                    if attrName not in structHeaders
                        structHeaders.push attrName
                for attrName in structHeaders
                    if attrName of row.structs
                        structs.push row.structs[attrName]
                    else
                        structs.push ""

                newRow = [corpus, row.match.position, leftContext.join(" "), match.join(" "), rightContext.join(" ")].concat structs
                res.push newRow
            else if row.newCorpus
                corpus = row.newCorpus

        headers = ["corpus", "match_position", "left context", "match", "right_context"].concat structHeaders
        res = [headers].concat res

        res.push emptyRow headers.length
        for row in padRows searchInfo, headers.length
            res.push row

        return res

    transformData = (dataType, data, requestInfo, totalHits) ->
        searchInfo = createSearchInfo requestInfo, totalHits
        if dataType == "annotations"
            return transformDataToAnnotations data, searchInfo
        if dataType == "kwic"
            return transformDataToKWIC data, searchInfo
    
    makeContent = (fileType, transformedData) ->
        if fileType == "csv"
            dataDelimiter = ","
        if fileType == "tsv"
            dataDelimiter = "	"
        
        csv = new CSV(transformedData, {
            delimiter: dataDelimiter
        })

        return csv.encode()

    # dataType: either "kwic" or "annotations"
    # fileType: either "csv" or "tsv"
    # data: json from the backend
    return {
        makeDownload: (dataType, fileType, data, requestInfo, totalHits) ->
            tmp = transformData dataType, data, requestInfo, totalHits
            tmp2 = makeContent fileType, tmp
            return createFile dataType, fileType, tmp2
    }
