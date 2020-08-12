/** @format */
const korpApp = angular.module("korpApp")
korpApp.factory("kwicDownload", function () {
    const emptyRow = function (length) {
        return _.fill(new Array(length), "")
    }

    const createFile = function (dataType, fileType, content) {
        const date = moment().format("YYYYDDMM_HHmmss")
        const filename = `korp_${dataType}_${date}.${fileType}`
        const blobURL = window.URL.createObjectURL(
            new Blob([content], { type: `text/${fileType}` })
        )
        return [filename, blobURL]
    }

    const padRows = (data, length) =>
        _.map(data, function (row) {
            const newRow = emptyRow(length)
            newRow[0] = row
            return newRow
        })

    const createSearchInfo = function (requestInfo, totalHits) {
        const rows = []
        const fields = ["cqp", "context", "within", "sorting", "start", "end", "hits"]
        for (let field of fields) {
            var row
            if (field === "cqp") {
                row = `## CQP query: ${requestInfo.cqp}`
            }
            if (field === "context") {
                row = `## context: ${requestInfo.default_context}`
            }
            if (field === "within") {
                row = `## within: ${requestInfo.default_within}`
            }
            if (field === "sorting") {
                const sorting = requestInfo.sort || "none"
                row = `## sorting: ${sorting}`
            }
            if (field === "start") {
                row = `## start: ${requestInfo.start}`
            }
            if (field === "end") {
                const cqpQuery = ""
                row = `## end: ${requestInfo.end}`
            }
            if (field === "hits") {
                row = `## Total hits: ${totalHits}`
            }
            rows.push(row)
        }
        return rows
    }

    const transformDataToAnnotations = function (data, searchInfo) {
        const headers = _.filter(
            _.keys(data[1].tokens[0]),
            (val) =>
                val.indexOf("_") !== 0 &&
                val !== "structs" &&
                val !== "$$hashKey" &&
                val !== "position"
        )
        const columnCount = headers.length + 1
        let corpus
        const res = padRows(searchInfo, columnCount)
        res.push(["match"].concat(headers))
        for (let row of data) {
            if (row.tokens) {
                const textAttributes = []
                for (let attrName in row.structs) {
                    const attrValue = row.structs[attrName]
                    textAttributes.push(attrName + ': "' + attrValue + '"')
                }
                const hitInfo = emptyRow(columnCount)
                hitInfo[0] = `# ${corpus}; text attributes: ${textAttributes.join(", ")}`
                res.push(hitInfo)

                for (let token of row.tokens || []) {
                    let match = ""
                    for (matchObj of [row.match].flat()) {
                        if (token.position >= matchObj.start && token.position < matchObj.end) {
                            match = "***"
                            break
                        }
                    }
                    const newRow = [match]
                    for (let field of headers) {
                        newRow.push(token[field])
                    }
                    res.push(newRow)
                }
            } else if (row.newCorpus) {
                corpus = row.newCorpus
            }
        }

        return res
    }

    const transformDataToKWIC = function (data, searchInfo) {
        let row
        let corpus
        const structHeaders = []
        let res = []
        for (row of data) {
            if (row.tokens) {
                if (row.isLinked) {
                    // parallell mode does not have matches or structs for the linked sentences
                    // current wordaround is to add all tokens to the left context
                    res.push(["", "", row.tokens.map((token) => token.word).join(" "), "", ""])
                    continue
                }

                var attrName, token
                const leftContext = []
                const match = []
                const rightContext = []

                if (row.match instanceof Array) {
                    // the user has searched "not-in-order" and we cannot have a left, match and right context for the download
                    // put all data in leftContext
                    for (token of row.tokens) {
                        leftContext.push(token.word)
                    }
                } else {
                    for (token of row.tokens.slice(0, row.match.start)) {
                        leftContext.push(token.word)
                    }
                    for (token of row.tokens.slice(row.match.start, row.match.end)) {
                        match.push(token.word)
                    }
                    for (token of row.tokens.slice(row.match.end, row.tokens.length)) {
                        rightContext.push(token.word)
                    }
                }

                const structs = []
                for (attrName in row.structs) {
                    if (!structHeaders.includes(attrName)) {
                        structHeaders.push(attrName)
                    }
                }
                for (attrName of structHeaders) {
                    if (attrName in row.structs) {
                        structs.push(row.structs[attrName])
                    } else {
                        structs.push("")
                    }
                }
                const newRow = [
                    corpus,
                    row.match instanceof Array
                        ? row.match.map((match) => match.position).join(", ")
                        : row.match.position,
                    leftContext.join(" "),
                    match.join(" "),
                    rightContext.join(" "),
                ].concat(structs)
                res.push(newRow)
            } else if (row.newCorpus) {
                corpus = row.newCorpus
            }
        }

        const headers = [
            "corpus",
            "match_position",
            "left context",
            "match",
            "right_context",
        ].concat(structHeaders)
        res = [headers].concat(res)

        res.push(emptyRow(headers.length))
        for (let row of padRows(searchInfo, headers.length)) {
            res.push(row)
        }

        return res
    }

    const transformData = function (dataType, data, requestInfo, totalHits) {
        const searchInfo = createSearchInfo(requestInfo, totalHits)
        if (dataType === "annotations") {
            return transformDataToAnnotations(data, searchInfo)
        }
        if (dataType === "kwic") {
            return transformDataToKWIC(data, searchInfo)
        }
    }

    const makeContent = function (fileType, transformedData) {
        let dataDelimiter
        if (fileType === "csv") {
            dataDelimiter = ","
        }
        if (fileType === "tsv") {
            dataDelimiter = "\t"
        }

        const csv = new CSV(transformedData, {
            delimiter: dataDelimiter,
        })

        return csv.encode()
    }

    // dataType: either "kwic" or "annotations"
    // fileType: either "csv" or "tsv"
    // data: json from the backend
    return {
        makeDownload(dataType, fileType, data, requestInfo, totalHits) {
            const tmp = transformData(dataType, data, requestInfo, totalHits)
            const tmp2 = makeContent(fileType, tmp)
            return createFile(dataType, fileType, tmp2)
        },
    }
})
