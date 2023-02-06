/** @format */
let html = String.raw
export const mapTabsComponent = () => ({
    replace: true,
    template: html`
        <uib-tab ng-repeat="promise in $ctrl.tabs" map-ctrl="map-ctrl" select="onentry()">
            <uib-tab-heading class="map_tab" ng-class="{loading : loading}"
                >{{ 'map' | loc:lang}}<span tab-spinner="tab-spinner" ng-click="closeTab($index, $event)"></span
            ></uib-tab-heading>
            <div class="map_result" ng-class="{loading : loading}">
                <korp-error ng-if="error"></korp-error>
                <div ng-if="!loading && numResults != 0">
                    <div class="rickshaw_legend" id="mapHeader">
                        <div
                            class="mapgroup"
                            ng-repeat="(label, group) in markerGroups"
                            ng-class="group.selected ? '' : 'disabled'"
                            ng-click="toggleMarkerGroup(label)"
                        >
                            <span class="check">✔</span>
                            <div class="swatch" style="background-color: {{group.color}}"></div>
                            <span class="label" ng-if="label != 'total'" ng-bind-html="label | trust"></span
                            ><span class="label" ng-if="label == 'total'">Σ</span>
                        </div>
                        <div style="float:right;padding-right: 5px;">
                            <label
                                ><input
                                    style="vertical-align: top;margin-top: 0px;margin-right: 5px;"
                                    type="checkbox"
                                    ng-model="useClustering"
                                />{{'map_cluster' | loc:lang}}</label
                            >
                        </div>
                    </div>
                    <sb-map
                        sb-center="center"
                        sb-markers="markerGroups"
                        sb-show-time="showTime"
                        sb-base-layer="mapSettings.baseLayer"
                        sb-marker-callback="newKWICSearch"
                        sb-selected-groups="selectedGroups"
                        sb-rest-color="restColor"
                        sb-use-clustering="useClustering"
                    ></sb-map>
                </div>
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
