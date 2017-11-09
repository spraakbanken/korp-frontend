createStatisticsService = () ->
    createColumns = (corpora, reduceVals, reduceValLabels) ->
        loc = {
            'sv' : "sv-SE"
            'en' : "gb-EN"
        }[$("body").scope().lang]
        
        valueFormatter = (row, cell, value, columnDef, dataContext) ->
            valTup = dataContext[columnDef.id + "_value"]
            return "<span><span class='relStat'>" + Number(valTup[1].toFixed(1)).toLocaleString(loc) + "</span> " +
                        "<span class='absStat'>(" + valTup[0].toLocaleString(loc) + ")</span></span>"

        corporaKeys = _.keys corpora
        minWidth = 100
        columns = []
        cl = settings.corpusListing.subsetFactory corporaKeys
        attrObj = cl.getStructAttrs()
        for [reduceVal, reduceValLabel] in _.zip reduceVals, reduceValLabels
            do(reduceVal) ->
                columns.push
                    id: reduceVal
                    name: reduceValLabel
                    field: "hit_value"
                    sortable: true
                    formatter: (row, cell, value, columnDef, dataContext) ->
                        if dataContext["rowId"] != 0
                            formattedValue = statisticsFormatting.reduceStringify(reduceVal, dataContext[reduceVal], attrObj[reduceVal])
                            dataContext["formattedValue"][reduceVal] = formattedValue
                            return "<span class=\"statistics-link\" data-row=" + dataContext["rowId"] + ">" + formattedValue + "</span>"
                        else
                            return "&Sigma;"
                    minWidth: minWidth
                    cssClass: "parameter-column"
                    headerCssClass: "localized-header"

        columns.push
            id: "pieChart"
            name: ""
            field: "hit_value"
            sortable: false
            formatter: (row, cell, value, columnDef, dataContext) ->
                return $.format '<img id="circlediagrambutton__%s" src="img/stats2.png" class="arcDiagramPicture"/>', dataContext.rowId
            maxWidth: 25
            minWidth: 25

        columns.push
            id: "total"
            name: "stats_total"
            field: "total_value"
            sortable: true
            formatter: valueFormatter
            minWidth: minWidth
            headerCssClass: "localized-header"

        $.each corporaKeys.sort(), (i, corpus) =>
            columns.push
                id: corpus
                name: settings.corpora[corpus.toLowerCase()].title
                field: corpus + "_value"
                sortable: true
                formatter: valueFormatter
                minWidth: minWidth
        return columns
    
    processData = (def, data, reduceVals, reduceValLabels, ignoreCase) ->
        columns = createColumns(data.corpora, reduceVals, reduceValLabels)

        statsWorker = new Worker "scripts/statistics_worker.js"
        statsWorker.onmessage = (e) ->
            searchParams = 
                reduceVals: reduceVals
                ignoreCase: ignoreCase
                corpora: _.keys data.corpora
            def.resolve [e.data, columns, searchParams]

        statsWorker.postMessage
            data: data
            reduceVals: reduceVals
            groupStatistics: settings.groupStatistics

    return processData: processData

window.statisticsService = createStatisticsService()
