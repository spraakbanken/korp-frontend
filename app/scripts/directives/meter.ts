/** @format */
import _ from "lodash"
import angular, { IScope } from "angular"
import { loc } from "@/i18n"
import { html } from "@/util"
import { CompareItem } from "@/services/backend"

type MeterScope = IScope & {
    meter: CompareItem
    max: number
    stringify: ((x: string) => string)[]
    displayWd: string
    loglike: number
    tooltipHTML: string
}

angular.module("korpApp").directive("meter", () => ({
    template: html`<div>
        <div class="background" ng-bind-html="displayWd | trust"></div>
        <div class="abs badge" uib-tooltip-html="tooltipHTML | trust">{{meter.abs}}</div>
    </div>`,
    replace: true,
    scope: {
        meter: "=",
        max: "=",
        stringify: "=",
    },
    link(scope: MeterScope, elem, attr) {
        const zipped = _.zip(scope.meter.tokenLists, scope.stringify)
        scope.displayWd = _.map(zipped, function (...args) {
            const [tokens, stringify] = args[0]
            return _.map(tokens, function (token) {
                if (token === "|" || token === "") {
                    return "&mdash;"
                } else {
                    return stringify(token)
                }
            }).join(" ")
        }).join(";")

        scope.loglike = Math.abs(scope.meter.loglike)

        scope.tooltipHTML = html`${loc("statstable_absfreq")}: ${scope.meter.abs}
            <br />
            loglike: ${scope.loglike}`

        const w = 394
        const part = scope.loglike / Math.abs(scope.max)

        const bkg = elem.find(".background")
        bkg.width(Math.round(part * w))
    },
}))
