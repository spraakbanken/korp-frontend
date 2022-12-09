/** @format */
import { WordPictureResults } from "./results/word_picture_results.js"
import { StatsResults } from "./results/stats_results.js"
import { GraphResults } from "./results/trend_results.js"

const korpFailImg = require("../img/korp_fail.svg")

const resultClasses = {}
resultClasses.WordPictureResults = WordPictureResults
resultClasses.StatsResults = StatsResults
resultClasses.GraphResults = GraphResults

angular.module("korpApp").directive("constr", ($window) => ({
    scope: true,

    link(scope, elem, attr) {
        const instance = new resultClasses[attr.constr](elem, scope)
        if (attr.constrName) {
            $window[attr.constrName] = instance
        }

        scope.instance = instance
        scope.$parent.instance = instance
    },
}))
