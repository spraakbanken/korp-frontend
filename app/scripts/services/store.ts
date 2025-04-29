/** @format */
import angular from "angular"
import settings from "@/settings"
import { RootScope, StoredFilterValues } from "@/root-scope.types"
import { UtilsService } from "@/services/utils"

/**
 * @file The store service provides state management. It uses the Root Scope to store and watch properties.
 * It is wrapped in a Proxy to allow direct access to properties as well as the service methods.
 */

export type Store = {
    /** Last executed search query. */
    activeSearch?: {
        /** "word", "lemgram" or "cqp" */
        type: string
        val: string
    }
    /** Selected corpus ids in lowercase */
    corpus: string[]
    /** What modal to show */
    display?: "about"
    /** The current Extended search query as CQP */
    extendedCqp?: string
    /** A simple attribute–values structure of selected filters. */
    global_filter: StoredFilterValues
    /** UI language */
    lang: string
    /** The current Simple search query as CQP */
    simpleCqp?: string
    /** Whether frequency numbers should be shown as absolute or relative (per million tokens) */
    statsRelative: boolean
}

export type StoreBase = {
    initialize: () => void
    get: <K extends keyof Store>(key: K) => Store[K]
    set: <K extends keyof Store>(key: K, value: Store[K]) => void
    watch: <K extends keyof Store>(subject: K, listener: (newValue: Store[K], oldValue: Store[K]) => void) => void
}

export type StoreService = StoreBase & Store

angular.module("korpApp").factory("store", [
    "$rootScope",
    "utils",
    ($rootScope: RootScope, utils: UtilsService): StoreService => {
        // Use the root scope for storing these variables, but keep their types separate.
        // This alias prevents TypeScript errors when accessing the store properties.
        // They can still be accessed as `$root.lang` etc in templates.
        const rootScopeStore = $rootScope as unknown as Store

        const initialize = () => {
            rootScopeStore.activeSearch = undefined
            rootScopeStore.corpus = []
            rootScopeStore.global_filter = {}
            rootScopeStore.display = undefined
            rootScopeStore.statsRelative = false
            // Let `lang` be empty at init
        }

        // Sync to url
        utils.setupHash($rootScope, {
            key: "corpus",
            val_in: (str) => (str ? str.split(",") : []),
            val_out: (arr) => arr.join(",") || null,
        })
        utils.setupHash($rootScope, { key: "display" })
        utils.setupHash($rootScope, {
            key: "global_filter",
            // Store in URL as base64-encoded JSON
            default: btoa(JSON.stringify({})),
            val_in: (str) => (str ? JSON.parse(atob(str)) : {}),
            val_out: (obj: StoredFilterValues) => btoa(JSON.stringify(obj)),
        })
        // Await locale data before setting lang, otherwise the `loc` template filter will trigger too early.
        $rootScope.$watch("loc_data", (newValue, oldValue) => {
            if (newValue && !oldValue) {
                utils.setupHash($rootScope, {
                    key: "lang",
                    default: settings["default_language"],
                })
            }
        })

        const service: StoreBase = {
            initialize,
            get: (key) => rootScopeStore[key],
            set: (key, value) => (rootScopeStore[key] = value),
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
