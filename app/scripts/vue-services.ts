/** @format */

import angular, { type auto } from "angular"
import { RootScope } from "./root-scope.types"
import { ServiceTypes } from "./util"

export let rootScope: RootScope

angular.module("korpApp").run([
    "$injector",
    ($injector: auto.IInjectorService) => {
        // Enhance return type of $injector.get()
        const getService: <K extends keyof ServiceTypes>(name: K) => ServiceTypes[K] = $injector.get
        rootScope = getService("$rootScope")
    },
])
