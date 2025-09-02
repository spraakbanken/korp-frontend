/** @format */
import angular, { IScope } from "angular"
import { HashParams } from "@/urlparams"
import { LocationService } from "@/services/types"

export type UtilsService = {
    /** Set up sync between a url param and a scope variable. */
    setupHash: <K extends keyof HashParams>(scope: IScope, config: SetupHashConfigItem<K>) => void
}

type SetupHashConfigItem<K extends keyof HashParams, T = any> = {
    /** Name of url param */
    key: K
    /** Name of scope variable; defaults to `key` */
    scope_name?: string
    /** Default value of the scope variable, corresponding to the url param being empty */
    default?: HashParams[K]
    /** Parse url param value */
    val_in?: (val: HashParams[K]) => T
    /** Stringify scope variable value */
    val_out?: (val: T) => HashParams[K]
}

angular.module("korpApp").factory("utils", [
    "$location",
    ($location: LocationService): UtilsService => ({
        setupHash(scope, config) {
            // Sync from url to scope
            const onWatch = () => {
                let val = $location.search()[config.key]
                if (val == null) {
                    if (config.default != null) val = config.default
                    else return
                }
                if (config.val_in) val = config.val_in(val)

                if (config.scope_name) {
                    // @ts-ignore
                    scope[config.scope_name] = val
                } else {
                    // @ts-ignore
                    scope[config.key] = val
                }
            }
            onWatch()
            scope.$watch(() => $location.search()[config.key], onWatch)

            // Sync from scope to url
            scope.$watch(config.scope_name || config.key, (val: any) => {
                val = config.val_out ? config.val_out(val) : val
                if (val === config.default) {
                    val = null
                }
                $location.search(config.key, val || null)
            })
        },
    }),
])
