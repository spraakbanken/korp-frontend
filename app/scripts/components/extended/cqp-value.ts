/** @format */
import angular, { ICompileService, IController, IControllerService, IScope } from "angular"
import _ from "lodash"
import { AttributeOption } from "@/corpus_listing"
import { Condition, DateRange } from "@/cqp_parser/cqp.types"
import extendedComponents from "./widgets"
import { Widget, WidgetScope } from "./widgets/common"
import { defaultWidget } from "./widgets/default"

type ExtendedCqpValueController = IController & {
    change: (event: { term: Partial<Condition> }) => void
    attributeDefinition: AttributeOption
    term: Condition
}

type ChildScope = IScope & {
    model?: Condition["val"]
    orObj?: Condition
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

                const childScope: Partial<WidgetScope<Condition["val"]>> & IScope = $scope.$new()
                childScope.$watch("model", (val: Condition["val"]) => ctrl.change({ term: { val } }))
                childScope.$watch("orObj.flags", (flags: Condition["flags"]) => ctrl.change({ term: { flags } }), true)

                // orObj name preserved for backward-compatability with components
                childScope.orObj = ctrl.term
                _.extend(childScope, ctrl.attributeDefinition)
                childScope.model = ctrl.term.val

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
                    const component = ctrl.attributeDefinition["extended_component"]
                    const name = typeof component === "string" ? component : component.name
                    const widget = extendedComponents[name]
                    if (_.isFunction(widget)) {
                        const options = typeof component == "object" ? component.options : {}
                        return widget(options)
                    }
                    return widget
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
