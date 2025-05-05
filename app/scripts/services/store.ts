/** @format */
import angular from "angular"
import settings from "@/settings"
import { RootScope } from "@/root-scope.types"
import { UtilsService } from "@/services/utils"
import { Attribute } from "@/settings/config.types"
import { CqpQuery } from "@/cqp_parser/cqp.types"
import { getLocData } from "@/loc-data"
import { getAllCorporaInFolders } from "@/components/corpus-chooser/util"
import { QueryParamSort } from "@/backend/types/query"

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
    /** CQP fragment built from selected filter values. */
    globalFilter?: CqpQuery
    /** Filter data by attribute name */
    globalFilterData: Record<string, FilterData>
    /** A simple attribute–values structure of selected filters. */
    global_filter: Record<string, string[]>
    /** Hits per page */
    hpp: number
    /** In simple search, match case-insensitive */
    isCaseInsensitive: boolean
    /** UI language */
    lang: string
    /** Page number of KWIC result */
    page?: number
    /** Search result order */
    sort: QueryParamSort
    /** The current Simple search query as CQP */
    simpleCqp?: string
    /** Whether frequency numbers should be shown as absolute or relative (per million tokens) */
    statsRelative: boolean
}

export type FilterData = {
    attribute: Attribute
    /** Selected values */
    value: string[]
    /** Sorted list of options with counts */
    options: [string, number][]
}

export type StoreBase = {
    initialize: () => void
    get: <K extends keyof Store>(key: K) => Store[K]
    set: <K extends keyof Store>(key: K, value: Store[K]) => void
    watch: <K extends keyof Store>(
        subject: K,
        listener: (newValue: Store[K], oldValue: Store[K]) => void,
        deep?: boolean
    ) => void
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
            rootScopeStore.corpus = []
            rootScopeStore.globalFilterData = {}
            rootScopeStore.global_filter = {}
            rootScopeStore.hpp = settings["hits_per_page_default"]
            rootScopeStore.isCaseInsensitive = !!settings["input_case_insensitive_default"]
            rootScopeStore.page = 0
            rootScopeStore.sort = ""
        }

        // Sync to url
        utils.setupHash($rootScope, {
            key: "corpus",
            val_in: (str) => {
                if (!str) return []
                const ids = str.split(",")
                // Resolve any folder ids to the contained corpus ids
                return ids.flatMap((id) => getAllCorporaInFolders(settings.folders, id))
            },
            val_out: (arr) => arr.join(",") || null,
        })
        utils.setupHash($rootScope, { key: "display" })
        utils.setupHash($rootScope, {
            key: "global_filter",
            // Store in URL as base64-encoded JSON
            default: btoa(JSON.stringify({})),
            val_in: (str) => (str ? JSON.parse(atob(str)) : {}),
            val_out: (obj: Record<string, string[]>) => btoa(JSON.stringify(obj)),
        })
        utils.setupHash($rootScope, { key: "hpp", val_in: Number, default: settings["hits_per_page_default"] })
        utils.setupHash($rootScope, { key: "isCaseInsensitive", val_out: (x) => !!x || undefined })
        utils.setupHash($rootScope, { key: "page", val_in: Number })
        utils.setupHash($rootScope, { key: "sort", default: "" })
        // Await locale data before setting lang, otherwise the `loc` template filter will trigger too early.
        getLocData().then(() => {
            utils.setupHash($rootScope, {
                key: "lang",
                default: settings["default_language"],
            })
        })

        const service: StoreBase = {
            initialize,
            get: (key) => rootScopeStore[key],
            set: (key, value) => (rootScopeStore[key] = value),
            watch: (subject, listener, deep) => $rootScope.$watch(subject, listener, deep),
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
