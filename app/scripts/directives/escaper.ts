/** @format */
import angular, { IScope } from "angular"
import { Condition } from "@/cqp_parser/cqp.types"
import { regescape, unregescape } from "@/util"

type EscaperScope = IScope & {
    escape: boolean
    input: string
    model: string
    orObj: Condition
}

angular.module("korpApp").directive("escaper", () => ({
    link($scope: EscaperScope) {
        /** Check if current operator uses regexp */
        const isRegexpOp = () => ["*=", "!*=", "regexp_contains", "not_regexp_contains"].includes($scope.orObj.op)

        // Enable escape/unescape as long as `escape` is not false and the current operator doesn't use regexp
        const escape = (val: string) => ($scope.escape !== false && !isRegexpOp() ? regescape(val) : val)
        const unescape = (val: string) => ($scope.escape !== false && !isRegexpOp() ? unregescape(val) : val)

        // Render input value unescaped
        $scope.input = unescape($scope.model)
        // Escape special characters on change (if enabled)
        $scope.$watch("input", () => ($scope.model = escape($scope.input)))
        $scope.$watch("orObj.op", () => ($scope.model = escape($scope.input)))
    },
}))
