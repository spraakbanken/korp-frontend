/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const pieChartImg = require("../img/stats2.png")

const createStatisticsService = function() {
    const createColumns = function(corpora, reduceVals, reduceValLabels) {
        const loc = {
            'sv' : "sv-SE",
            'en' : "gb-EN"
        }[$("body").scope().lang]
        
        const valueFormatter = function(row, cell, value, columnDef, dataContext) {
            const valTup = dataContext[columnDef.id + "_value"]
            return `<span><span class='relStat'>${Number(valTup[1].toFixed(1)).toLocaleString(loc)}</span> ` +
                        "<span class='absStat'>(" + valTup[0].toLocaleString(loc) + ")</span></span>"
        }

        const corporaKeys = _.keys(corpora)
        const minWidth = 100
        const columns = []
        const cl = settings.corpusListing.subsetFactory(corporaKeys)
        const attrObj = cl.getStructAttrs()
        for (var [reduceVal, reduceValLabel] of Array.from(_.zip(reduceVals, reduceValLabels))) {
            (reduceVal =>
                columns.push({
                    id: reduceVal,
                    name: reduceValLabel,
                    field: "hit_value",
                    sortable: true,
                    formatter(row, cell, value, columnDef, dataContext) {
                        if (dataContext["rowId"] !== 0) {
                            const formattedValue = statisticsFormatting.reduceStringify(reduceVal, dataContext[reduceVal], attrObj[reduceVal])
                            dataContext["formattedValue"][reduceVal] = formattedValue
                            return `<span class="statistics-link" data-row=${dataContext["rowId"]}>${formattedValue}</span>`
                        } else {
                            return "&Sigma;"
                        }
                    },
                    minWidth,
                    cssClass: "parameter-column",
                    headerCssClass: "localized-header"
                })
            )(reduceVal)
        }

        columns.push({
            id: "pieChart",
            name: "",
            field: "hit_value",
            sortable: false,
            formatter(row, cell, value, columnDef, dataContext) {
                return $.format(`<img id="circlediagrambutton__%s" src="${pieChartImg}" class="arcDiagramPicture"/>`, dataContext.rowId)
            },
            maxWidth: 25,
            minWidth: 25
        })

        columns.push({
            id: "total",
            name: "stats_total",
            field: "total_value",
            sortable: true,
            formatter: valueFormatter,
            minWidth,
            headerCssClass: "localized-header"
        })

        $.each(corporaKeys.sort(), (i, corpus) => {
            return columns.push({
                id: corpus,
                name: settings.corpora[corpus.toLowerCase()].title,
                field: corpus + "_value",
                sortable: true,
                formatter: valueFormatter,
                minWidth
            })
        })
        return columns
    }
    
    const processData = function(def, data, reduceVals, reduceValLabels, ignoreCase) {
        const columns = createColumns(data.corpora, reduceVals, reduceValLabels)

        const statsWorker = new Worker("worker.js")
        statsWorker.onmessage = function(e) {
            const searchParams = { 
                reduceVals,
                ignoreCase,
                corpora: _.keys(data.corpora)
            }
            return def.resolve([e.data, columns, searchParams])
        }

        return statsWorker.postMessage({
            data,
            reduceVals,
            groupStatistics: settings.groupStatistics
        })
    }

    return { processData }
}

window.statisticsService = createStatisticsService()
