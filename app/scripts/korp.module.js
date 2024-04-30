/** @format */
import "angular-ui-bootstrap"
import "angular-spinner"
import "angular-ui-sortable"
import "geokorp/dist/scripts/geokorp"
import "geokorp/dist/scripts/geokorp-templates"
import "angular-dynamic-locale"
import "angular-filter"

const korpApp = angular.module("korpApp", [
    "ui.bootstrap.typeahead",
    "uib/template/typeahead/typeahead-popup.html",
    "uib/template/typeahead/typeahead-match.html",
    "ui.bootstrap.tooltip",
    "uib/template/tooltip/tooltip-popup.html",
    "uib/template/tooltip/tooltip-html-popup.html",
    "ui.bootstrap.modal",
    "uib/template/modal/window.html",
    "ui.bootstrap.tabs",
    "uib/template/tabs/tabset.html",
    "uib/template/tabs/tab.html",
    "ui.bootstrap.dropdown",
    "ui.bootstrap.pagination",
    "uib/template/pagination/pagination.html",
    "ui.bootstrap.datepicker",
    "uib/template/datepicker/datepicker.html",
    "uib/template/datepicker/day.html",
    "uib/template/datepicker/month.html",
    "uib/template/datepicker/year.html",
    "ui.bootstrap.timepicker",
    "uib/template/timepicker/timepicker.html",
    "ui.bootstrap.buttons",
    "ui.bootstrap.popover",
    "uib/template/popover/popover.html",
    "uib/template/popover/popover-template.html",
    "angularSpinner",
    "ui.sortable",
    "sbMap",
    "tmh.dynamicLocale",
    "angular.filter",
])

export default korpApp
