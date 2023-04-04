/** @format */
let html = String.raw
export const graphTabsComponent = () => ({
    replace: true,
    template: html`
        <uib-tab ng-repeat="data in $ctrl.tabs" graph-ctrl="graph-ctrl">
            <uib-tab-heading ng-class="{not_loading: progress > 99}"
                >{{'graph' | loc:lang}}
                <div class="tab_progress" style="width:{{progress || 0}}%" ng-show="loading"></div>
                <span ng-click="closeTab($index, $event)" tab-spinner="tab-spinner"></span>
            </uib-tab-heading>
            <trend-diagram data="data" on-progress="onProgress" update-loading="updateLoading"></trend-diagram>
        </uib-tab>
    `,
    bindToController: {
        tabs: "<",
    },
    scope: {},
    controllerAs: "$ctrl",
    controller: [() => {}],
})
