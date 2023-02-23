/** @format */
let html = String.raw
export const advancedSearchComponent = {
    template: html` <div>
        <div class="well well-small">
            {{'active_cqp_simple' | loc:$root.lang}}:
            <pre>{{$root.simpleCQP}}</pre>
        </div>
        <div class="well well-small">
            {{'active_cqp_extended' | loc:$root.lang}}:
            <pre>{{$root.extendedCQP}}</pre>
        </div>
        <div class="well well-small">
            {{'cqp_query' | loc:$root.lang}}:
            <div class="pull-right">
                <i class="fa fa-file-o"></i>
                <a href="http://cwb.sourceforge.net/files/CQP_Tutorial.pdf" target="_blank">
                    {{'cqp_docs' | loc:$root.lang}}
                </a>
            </div>
            <textarea class="w-full font-mono" ng-model="$ctrl.cqp"></textarea>
        </div>
        <search-submit
            pos="right"
            on-search="$ctrl.onSearch()"
            on-search-save="$ctrl.onSearchSave(name)"
        ></search-submit>
    </div>`,
    bindings: {},
    controller: [
        "compareSearches",
        "$location",
        "$timeout",
        function (compareSearches, $location, $timeout) {
            const $ctrl = this

            if ($location.search().search && $location.search().search.split("|")) {
                var [type, ...expr] = $location.search().search.split("|")
                expr = expr.join("|")
            }

            if (type === "cqp" && expr) {
                $ctrl.cqp = expr
            } else {
                $ctrl.cqp = "[]"
            }

            $ctrl.onSearch = () => {
                $location.search("search", null)
                $location.search("page", null)
                $location.search("within", null)
                $location.search("in_order", null)
                $timeout(() => $location.search("search", `cqp|${$ctrl.cqp}`), 0)
            }

            $ctrl.onSearchSave = (name) => {
                compareSearches.saveSearch(name, $ctrl.cqp)
            }
        },
    ],
}
