/** @format */
let html = String.raw
export const kwicTabsComponent = () => ({
    replace: true,
    template: html`
        <uib-tab example-ctrl="example-ctrl" ng-repeat="kwicTab in $ctrl.tabs" select="onentry()" deselect="onexit()">
            <uib-tab-heading ng-class="{not_loading: progress == 100, loading : loading}"
                >KWIC<span ng-click="closeTab($index, $event)" tab-spinner="tab-spinner"></span
            ></uib-tab-heading>
            <korp-error ng-if="error"></korp-error>
            <div
                class="results-kwic"
                ng-if="!error"
                ng-class="{reading_mode : exampleReadingMode, not_loading: !loading, loading : loading}"
            >
                <kwic
                    aborted="aborted"
                    loading="loading"
                    active="active"
                    hits-display="hits_display"
                    hits="hits"
                    data="data"
                    is-reading="is_reading"
                    page="page"
                    page-event="pageChange"
                    context-change-event="toggleReading"
                    hits-per-page="hitsPerPage"
                    prev-params="proxy.prevParams"
                    prev-request="proxy.prevRequest"
                    corpus-order="corpusOrder"
                ></kwic>
            </div>
        </uib-tab>
    `,
    bindToController: {
        tabs: "<",
    },
    scope: {},
    controllerAs: "$ctrl",
    controller: [() => {}],
})
