/** @format */
import { HashParams, LocationService } from "@/urlparams"
import angular, { IScope } from "angular"

export type UtilsService = {
    /** Set up sync between a url param and a scope variable. */
    setupHash: <K extends keyof HashParams>(scope: IScope, config: SetupHashConfigItem<K>) => void
}

type SetupHashConfigItem<K extends keyof HashParams, T = any> = {
    /** Name of url param */
    key: K
    /** Name of scope variable; defaults to `key` */
    scope_name?: string
    /** A function on the scope to pass value to, instead of setting `scope_name` */
    scope_func?: string
    /** Expression to watch for changes; defaults to `scope_name` */
    expr?: string
    /** Default value of the scope variable, corresponding to the url param being empty */
    default?: HashParams[K]
    /** Runs when the value is changed in scope or url */
    post_change?: (val: HashParams[K]) => void
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
                    if (config.default != null) {
                        val = config.default
                    } else {
                        if (config.post_change) config.post_change(val)
                        return
                    }
                }

                val = config.val_in ? config.val_in(val) : val

                if (config.scope_name) {
                    // @ts-ignore
                    scope[config.scope_name] = val
                } else if (config.scope_func) {
                    // @ts-ignore
                    scope[config.scope_func](val)
                } else {
                    // @ts-ignore
                    scope[config.key] = val
                }
            }
            onWatch()
            scope.$watch(() => $location.search()[config.key], onWatch)

            // Sync from scope to url
            scope.$watch(config.expr || config.scope_name || config.key, (val: any) => {
                val = config.val_out ? config.val_out(val) : val
                if (val === config.default) {
                    val = null
                }
                $location.search(config.key, val || null)
                if (config.post_change) config.post_change(val)
            })
        },
    }),
])
