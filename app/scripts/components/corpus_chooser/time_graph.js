/** @format */
import statemachine from "@/statemachine"

export const ccTimeGraphComponent = {
    template: `
    <script type="text/ng-template" id="timepopover.html">
        <div class="p-4">
            <h4 ng-if="$ctrl.timeHover.isRestData" class="mt-0">
                {{"corpselector_rest_time" | loc:lang}}
            </h4>

            <h4 ng-if="!$ctrl.timeHover.isRestData" class="mt-0">
                {{"corpselector_time" | loc:lang}} {{$ctrl.timeHover.year}}
            </h4>

            {{'corpselector_time_chosen' | loc:lang}}: {{$ctrl.timeHover.val | prettyNumber}} {{'corpselector_tokens' | loc:lang}}
            <br>
            {{'corpselector_of_total' | loc:lang}}: {{$ctrl.timeHover.total | prettyNumber}} {{'corpselector_tokens' | loc:lang}}
        </div>
    </script>
    <div id="time"
        class="flex"
        uib-popover-template="'timepopover.html'"
        popover-class="timepopover"
        popover-popup-delay="200"
        popover-placement="right"
        popover-trigger="'mouseenter'">
        <div id="time_graph"></div>        
    </div>
    <style>
        .timepopover {
            margin-left: 0 !important;
            z-index: 10000;
        }
    </style>
`,
    controller: [
        "$timeout",
        "$rootScope",
        function controller($timeout, $rootScope) {
            let $ctrl = this

            $ctrl.timeProxy = new model.TimeProxy()

            const [allTimestruct, rest] = settings["time_data"]

            const hoverCallback = (year, val, total, isRestData) => {
                $timeout(() => ($ctrl.timeHover = { year, val, total, isRestData }), 0)
            }

            $rootScope.$on("corpuschooserchange", (e) => {
                onTimeGraphChange($ctrl.timeProxy, hoverCallback, allTimestruct, rest)
            })
            onTimeGraphChange($ctrl.timeProxy, hoverCallback, allTimestruct, rest)
        },
    ],
}

function getValByDate(date, struct) {
    let output = null
    $.each(struct, function (i, item) {
        if (date === item[0]) {
            output = item[1]
            return false
        }
    })

    return output
}

function onTimeGraphChange(timeProxy, hoverCallback, all_timestruct, rest) {
    if (all_timestruct.length == 0) {
        return
    }

    let timestruct = null
    let restdata = null
    let restyear = null

    let max = _.reduce(
        all_timestruct,
        function (accu, item) {
            if (item[1] > accu) {
                return item[1]
            }
            return accu
        },
        0
    )

    // the 46 here is the presumed value of
    // the height of the graph
    const one_px = max / 46

    const normalize = (array) =>
        _.map(array, function (item) {
            const out = [].concat(item)
            if (out[1] < one_px && out[1] > 0) {
                out[1] = one_px
            }
            return out
        })

    const output = _(settings.corpusListing.selected)
        .map("time")
        .filter(Boolean)
        .map(_.toPairs)
        .flatten(true)
        .reduce(function (memo, ...rest1) {
            const [a, b] = rest1[0]
            if (typeof memo[a] === "undefined") {
                memo[a] = b
            } else {
                memo[a] += b
            }
            return memo
        }, {})

    timestruct = timeProxy.compilePlotArray(output)
    const endyear = all_timestruct.slice(-1)[0][0]
    const yeardiff = endyear - all_timestruct[0][0]
    restyear = endyear + yeardiff / 25
    restdata = _(settings.corpusListing.selected)
        .filter((item) => item.time)
        .reduce((accu, corp) => accu + parseInt(corp.non_time || "0"), 0)

    const plots = [
        {
            data: normalize([].concat(all_timestruct, [[restyear, rest]])),
        },
        { data: normalize(timestruct) },
    ]
    if (restdata) {
        plots.push({
            data: normalize([[restyear, restdata]]),
        })
    }

    let plot = $.plot($("#time_graph"), plots, {
        bars: {
            show: true,
            fill: 1,
            align: "center",
        },

        grid: {
            hoverable: true,
            borderColor: "white",
        },

        yaxis: {
            show: false,
        },

        xaxis: {
            show: true,
            tickDecimals: 0,
        },

        hoverable: true,
        colors: ["lightgrey", "navy", "#cd5c5c"],
    })
    $.each($("#time_graph .tickLabel"), function () {
        if (parseInt($(this).text()) > new Date().getFullYear()) {
            $(this).hide()
        }
    })
    $("#time_graph").bind(
        "plothover",
        _.throttle(function (event, pos, item) {
            let total, val
            let date = Math.round(pos.x)
            if (date > new Date().getFullYear()) {
                hoverCallback(date, restdata, rest, true)
            } else {
                val = getValByDate(date, timestruct)
                total = getValByDate(date, all_timestruct)
                hoverCallback(date, val, total, false)
            }
        }, 50)
    )
}
