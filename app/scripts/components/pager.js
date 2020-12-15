/** @format */
export const kwicPagerName = "kwicPager"

let html = String.raw
export const kwicPager = {
    template: html`
        <div class="pager-wrapper" ng-show="$ctrl.totalHits > 0">
            <ul
                uib-pagination
                total-items="$ctrl.totalHits"
                ng-model="$ctrl.page"
                ng-click="$ctrl.localPageChange()"
                max-size="15"
                items-per-page="$ctrl.hitsPerPage"
                previous-text="‹"
                next-text="›"
                first-text="«"
                last-text="»"
                boundary-links="true"
                rotate="false"
            ></ul>
            <div class="page_input">
                <span>{{'goto_page' | loc:lang}} </span>
                <input
                    ng-model="$ctrl.gotoPage"
                    ng-keyup="$ctrl.onPageInput($event)"
                    ng-click="$event.stopPropagation()"
                />
                {{'of' | loc:lang}} {{$ctrl.numPages}}
            </div>
        </div>
    `,
    bindings: {
        totalHits: "<",
        currentPage: "<",
        pageChange: "&",
        hitsPerPage: "<",
    },
    controller: function KwicPagerCtrl() {
        const ctrl = this

        ctrl.$onChanges = function () {
            ctrl.numPages = Math.ceil(ctrl.totalHits / ctrl.hitsPerPage)
            const parsedPage = parseInt(ctrl.currentPage)
            ctrl.page = parsedPage ? parsedPage + 1 : 1 // pager starts on 1
        }

        ctrl.onPageInput = function ($event) {
            if ($event.keyCode === 13) {
                let page = ctrl.gotoPage
                if (isNaN(page)) {
                    return
                }
                if (page > ctrl.numPages) {
                    page = ctrl.numPages
                }
                if (page <= 0) {
                    page = "1"
                }
                ctrl.page = page
                ctrl.localPageChange()
            }
        }

        ctrl.localPageChange = function () {
            ctrl.pageChange({ page: Number(ctrl.page - 1) }) // pager starts counting at 1
        }
    },
}
