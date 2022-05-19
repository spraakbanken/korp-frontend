/** @format */
import extendedComponents from "@/extended.js"

export const extendedCQPValueComponent = {
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
        function ($scope, $controller, $compile, $element) {
            const ctrl = this

            let prevScope = null
            let modelChildWatch = null
            let flagsChildWatch = null

            ctrl.$onChanges = (changeObj) => {
                if (changeObj.attributeDefinition && ctrl.attributeDefinition) {
                    updateComponent(!changeObj.attributeDefinition.isFirstChange())
                }
            }

            function updateComponent(initialized) {
                if (initialized && ctrl.term.flags) {
                    // selected attribute changed
                    delete ctrl.term.flags["c"]
                }

                if (prevScope != null) {
                    prevScope.$destroy()
                }
                // what does this do? remove the watch?
                if (modelChildWatch) {
                    modelChildWatch()
                    flagsChildWatch()
                }

                const childScope = $scope.$new()
                modelChildWatch = childScope.$watch("model", (val) => {
                    ctrl.change({ term: { val } })
                })
                flagsChildWatch = childScope.$watch(
                    "orObj.flags",
                    (val) => {
                        ctrl.change({ term: { flags: val } })
                    },
                    true
                )

                // orObj name preserved for backward-compatability with components
                childScope.orObj = ctrl.term
                _.extend(childScope, ctrl.attributeDefinition)
                childScope.model = ctrl.term.val

                const locals = { $scope: childScope }
                prevScope = childScope
                let template, controller
                if (ctrl.attributeDefinition["extended_component"]) {
                    const def =
                        extendedComponents[
                            ctrl.attributeDefinition["extended_component"].name ||
                                ctrl.attributeDefinition["extended_component"]
                        ]
                    if (_.isFunction(def)) {
                        ;({ template, controller } = def(ctrl.attributeDefinition["extended_component"].options))
                    } else {
                        ;({ template, controller } = def)
                    }
                } else {
                    controller = extendedComponents.default.controller
                    if (ctrl.attributeDefinition["extended_template"]) {
                        template = ctrl.attributeDefinition["extended_template"]
                    } else {
                        let tmplObj
                        if (ctrl.attributeDefinition.value === "word") {
                            tmplObj = { maybe_placeholder: "placeholder='<{{\"any\" | loc:$root.lang}}>'" }
                        } else {
                            tmplObj = { maybe_placeholder: "" }
                        }

                        template = extendedComponents.default.template(tmplObj)
                    }
                }

                $controller(controller, locals)
                const tmplElem = $compile(template)(childScope)
                $element.html(tmplElem).addClass("arg_value")
            }
        },
    ],
}
