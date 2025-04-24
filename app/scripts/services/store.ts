/** @format */
import angular from "angular"
import { RootScope } from "@/root-scope.types"
import { UtilsService } from "@/services/utils"

/**
 * @file The store service provides state management. It uses the Root Scope to store and watch properties.
 * It is wrapped in a Proxy to allow direct access to properties as well as the service methods.
 */

type Store = Pick<RootScope, "show_modal" | "lang">

export type StoreBase = {
    initialize: () => void
    get: <K extends keyof Store>(key: K) => Store[K]
    set: <K extends keyof Store>(key: K, value: Store[K]) => void
    watch: (subject: string, listener: (newValue: any, oldValue: any) => void) => void
}

export type StoreService = StoreBase & Store

angular.module("korpApp").factory("store", [
    "$rootScope",
    "utils",
    ($rootScope: RootScope, utils: UtilsService): StoreService => {
        const initialize = () => {
            $rootScope.show_modal = false
        }

        // Sync to url
        utils.setupHash($rootScope, {
            key: "display",
            scope_name: "show_modal",
        })

        const service: StoreBase = {
            initialize,
            get: (key) => $rootScope[key],
            set: (key, value) => ($rootScope[key] = value as RootScope[typeof key]), // Why is this typecast needed?
            watch: (subject, listener) => $rootScope.$watch(subject, listener),
        }

        const handler: ProxyHandler<StoreService> = {
            // Provide service methods but also direct get/set of store properties.
            get: (target, prop) => (prop in target ? target[prop as keyof StoreBase] : target.get(prop as keyof Store)),
            set: (target, prop, value) => {
                if (prop in target) {
                    target[prop as keyof StoreBase] = value
                } else {
                    target.set(prop as keyof Store, value)
                }
                return true
            },
        }

        return new MyProxy(service, handler)
    },
])

/**
 * The built-in typing of the Proxy class assumes the same type for the target as for the proxy.
 * This lets us give two different types.
 * See https://github.com/microsoft/TypeScript/issues/20846
 */
const MyProxy = Proxy as {
    new <T, H extends object>(target: T, handler: ProxyHandler<H>): H
}
