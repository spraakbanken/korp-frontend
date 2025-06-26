/** @format */
import angular, { ICompileService, IController, IControllerService, IScope } from "angular"
import _ from "lodash"
import { AttributeOption } from "@/corpus_listing"
import { Condition } from "@/cqp_parser/cqp.types"
import extendedComponents from "./widgets"
import { Widget, WidgetScope } from "./widgets/common"
import { defaultWidget } from "./widgets/default"
import { getConfigurable, regescape, unregescape } from "@/util"

type ExtendedCqpValueController = IController & {
    change: (event: { term: Partial<Condition> }) => void
    attributeDefinition: AttributeOption
    term: Condition
}

angular.module("korpApp").component("extendedCqpValue", {
    bindings: {
        change: "&",
        attributeDefinition: "<",
        term: "<",
    },
    controller: [
        "$scope",
        "$controller",
        "$compile",
        "$element",
        function ($scope: IScope, $controller: IControllerService, $compile: ICompileService, $element: JQLite) {
            const ctrl = this as ExtendedCqpValueController

            ctrl.$onChanges = (changeObj) => {
                if (changeObj.attributeDefinition && ctrl.attributeDefinition) {
                    updateComponent(!changeObj.attributeDefinition.isFirstChange())
                }
            }

            function updateComponent(initialized: boolean) {
                if (initialized && ctrl.term.flags) {
                    // selected attribute changed
                    delete ctrl.term.flags["c"]
                }

                const childScope = $scope.$new() as WidgetScope<Condition["val"]> & IScope
                childScope.$watch("model", (val: Condition["val"]) => ctrl.change({ term: { val } }))
                childScope.$watch("orObj.flags", (flags: Condition["flags"]) => ctrl.change({ term: { flags } }), true)

                // orObj name preserved for backward-compatability with components
                childScope.orObj = ctrl.term
                _.extend(childScope, ctrl.attributeDefinition)
                childScope.model = ctrl.term.val

                // Set up regexp escaping
                // CQP natively uses regexp by default, so we need to escape input in most cases.
                // A few of our own operators should however allow regexp (= skip escaping).
                // Additionally, an attribute config can set `escape: false` to enable using regexp values with non-regexp operators.
                const shouldUseRegexp = () =>
                    ctrl.attributeDefinition.escape === false ||
                    ["*=", "!*=", "regexp_contains", "not_regexp_contains"].includes(childScope.orObj.op)
                const write = (val: string) => (shouldUseRegexp() ? val : regescape(val))
                const read = (val: string) => (shouldUseRegexp() ? val : unregescape(val))
                // Set initial input value
                childScope.input = read(childScope.model as string)
                // Sync from input to model, escaping special characters if needed
                childScope.$watch("input", () => (childScope.model = write(childScope.input)))
                childScope.$watch("orObj.op", () => (childScope.model = write(childScope.input)))

                const locals = { $scope: childScope }
                const { template, controller } = getWidget()

                // @ts-ignore
                $controller(controller, locals)
                const tmplElem = $compile(template)(childScope)
                $element.empty().append(tmplElem).addClass("arg_value")
            }

            function getWidget(): Widget {
                // Use the `extended_component` option if present
                if (ctrl.attributeDefinition["extended_component"]) {
                    const definition = ctrl.attributeDefinition["extended_component"]
                    return getConfigurable(extendedComponents, definition)!
                }

                const controller = defaultWidget.controller

                if (ctrl.attributeDefinition["extended_template"]) {
                    const template = ctrl.attributeDefinition["extended_template"]
                    return { template, controller }
                }

                const placeholder = ctrl.attributeDefinition.value === "word" ? "<{{'any' | loc:$root.lang}}>" : ""
                const template = defaultWidget.template({ placeholder })
                return { template, controller }
            }
        },
    ],
})
