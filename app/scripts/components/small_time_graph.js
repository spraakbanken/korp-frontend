/** @format */

export const smallTimeGraphComponent = {
    template: `
    <div id="time">
        <div id="time_graph" style="padding: 0px; position: relative;">
        <canvas
            class="flot-base"
            width="335"
            height="70"
            style="direction: ltr; position: absolute; left: 0px; top: 0px; width: 335px; height: 70px;"></canvas>
        <div class="flot-text" style="position: absolute; inset: 0px; font-size: smaller; color: rgb(84, 84, 84);">
            <div class="flot-x-axis flot-x1-axis xAxis x1Axis" style="position: absolute; inset: 0px;">
            <div class="flot-tick-label tickLabel" style="position: absolute; max-width: 47px; top: 51px; left: 57px; text-align: center;">
                1200
            </div>
            <div
                class="flot-tick-label tickLabel"
                style="position: absolute; max-width: 47px; top: 51px; left: 116px; text-align: center;"
            >
                1400
            </div>
            <div
                class="flot-tick-label tickLabel"
                style="position: absolute; max-width: 47px; top: 51px; left: 175px; text-align: center;"
            >
                1600
            </div>
            <div
                class="flot-tick-label tickLabel"
                style="position: absolute; max-width: 47px; top: 51px; left: 234px; text-align: center;"
            >
                1800
            </div>
            <div
                class="flot-tick-label tickLabel"
                style="position: absolute; max-width: 47px; top: 51px; left: 293px; text-align: center;"
            >
                2000
            </div>
            </div>
        </div>
        <canvas
            class="flot-overlay"
            width="335"
            height="70"
            style="direction: ltr; position: absolute; left: 0px; top: 0px; width: 335px; height: 70px;"
        ></canvas>
        </div>
        <div id="rest_time_graph"></div>
    </div>
    `,
    bindings: {},
    controller: [
        "$element",
        "utils",
        "$rootScope",
        "$compile",
        "$controller",
        function ($element, utils, $rootScope, $compile, $controller) {
            let $ctrl = this

            $rootScope.$on("corpuschooserchange", () => {
                // init it here?
            })
        },
    ],
}
