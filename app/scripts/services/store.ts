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
import { HashParams, LocationService } from "@/urlparams"
import { ModalData } from "@/components/app-modal"

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
    /** CQP query for Extended search, possibly with frontend-specific operators */
    cqp: string
    /** CQP query for each selected language in parallel mode; mapped to URL params `cqp_<lang>` */
    cqpParallel: Record<string, string>
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
    /** Whether tokens in current query should match in order; default is true */
    in_order: boolean
    /** UI language */
    lang: string
    /** In simple search, match anywhere in a word */
    mid_comp: boolean
    modal?: ModalData
    /** Page number of KWIC result */
    page?: number
    /** In parallel mode, what languages to build a query for */
    parallel_corpora: string[]
    /** In simple search, match beginning of word */
    prefix: boolean
    /** Randomized number used when sorting hits by random. Stored for reproducible urls. */
    random_seed?: number
    /** Whether to KWIC with more context */
    reading_mode: boolean
    /**
     * Search query for Simple or Advanced search: `<mode>|<query>`
     * where `mode` can be:
     *   - "word", for simple word search
     *   - "lemgram", when using autocomplete in Simple
     *   - "cqp", for advanced mode (`query` is a CQP expression)
     */
    search?: `${string}|${string}` | "cqp"
    /** The current Simple search query as CQP */
    simpleCqp?: string
    /** Search result order */
    sort: QueryParamSort
    /** Attributes on which to aggregate counts in statistics query */
    stats_reduce: string
    /** Attributes on which to aggregate counts, case-insensitively, in statistics query */
    stats_reduce_insensitive: string
    /** Whether frequency numbers should be shown as absolute or relative (per million tokens) */
    statsRelative: boolean
    /** In simple search, match end of word */
    suffix: boolean
    /** Chunk size to evaluate search query within, e.g. "sentence" or "paragraph" */
    within?: string
}

export type FilterData = {
    attribute: Attribute
    /** Selected values */
    value: string[]
    /** Sorted list of options with counts */
    options: [string, number][]
}

export type StoreBase = {
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
    "$location",
    "$rootScope",
    "utils",
    ($location: LocationService, $rootScope: RootScope, utils: UtilsService): StoreService => {
        // Use the root scope for storing these variables, but keep their types separate.
        // This alias prevents TypeScript errors when accessing the store properties.
        // They can still be accessed as `$root.lang` etc in templates.
        const rootScopeStore = $rootScope as unknown as Store

        const withinDefault = Object.keys(settings["default_within"] || {})[0]

        // Initialize
        rootScopeStore.corpus = []
        rootScopeStore.cqp = "[]"
        rootScopeStore.cqpParallel = {}
        rootScopeStore.globalFilterData = {}
        rootScopeStore.global_filter = {}
        rootScopeStore.hpp = settings["hits_per_page_default"]
        rootScopeStore.in_order = true
        rootScopeStore.isCaseInsensitive = !!settings["input_case_insensitive_default"]
        rootScopeStore.page = 0
        rootScopeStore.parallel_corpora = []
        rootScopeStore.sort = ""
        rootScopeStore.stats_reduce = "word"
        rootScopeStore.stats_reduce_insensitive = ""
        rootScopeStore.within = withinDefault

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
        utils.setupHash($rootScope, { key: "cqp", default: "[]" })
        utils.setupHash($rootScope, { key: "display" })
        utils.setupHash($rootScope, {
            key: "global_filter",
            // Store in URL as base64-encoded JSON
            default: btoa(JSON.stringify({})),
            val_in: (str) => (str ? JSON.parse(atob(str)) : {}),
            val_out: (obj: Record<string, string[]>) => btoa(JSON.stringify(obj)),
        })
        utils.setupHash($rootScope, { key: "hpp", val_in: Number, default: settings["hits_per_page_default"] })
        utils.setupHash($rootScope, {
            key: "in_order",
            val_in: (x) => x != "false",
            val_out: (x) => (x ? undefined : "false"),
        })
        utils.setupHash($rootScope, { key: "isCaseInsensitive", val_out: (x) => !!x || undefined })
        utils.setupHash($rootScope, {
            key: "mid_comp",
            // Deprecated param. Translate to prefix/suffix.
            post_change: (mid_comp) => {
                if (!mid_comp) return
                rootScopeStore.prefix = true
                rootScopeStore.suffix = true
                rootScopeStore.mid_comp = false
            },
        })
        utils.setupHash($rootScope, { key: "page", val_in: Number })
        utils.setupHash($rootScope, {
            key: "parallel_corpora",
            val_in: (str) => (str ? str.split(",") : []),
            val_out: (arr) => arr.join(",") || null,
        })
        utils.setupHash($rootScope, { key: "prefix", val_out: (x) => !!x || undefined })
        utils.setupHash($rootScope, { key: "random_seed", val_in: Number })
        utils.setupHash($rootScope, { key: "reading_mode", val_out: (x) => !!x || undefined })
        utils.setupHash($rootScope, { key: "search" })
        utils.setupHash($rootScope, { key: "sort", default: "" })
        utils.setupHash($rootScope, { key: "stats_reduce", default: "word" })
        utils.setupHash($rootScope, { key: "stats_reduce_insensitive", default: "" })
        utils.setupHash($rootScope, { key: "suffix", val_out: (x) => !!x || undefined })
        utils.setupHash($rootScope, { key: "within", default: withinDefault })
        // Await locale data before setting lang, otherwise the `loc` template filter will trigger too early.
        getLocData().then(() => {
            utils.setupHash($rootScope, {
                key: "lang",
                default: settings["default_language"],
            })
        })
        // Sync the cqpParallel property to multiple URL params.
        // Read URL params only once. We could watch them, but it's not worth it?
        Object.entries($location.search()).forEach(([key, value]) => {
            if (key.startsWith("cqp_")) {
                const lang = key.slice(4)
                const cqp = value as string
                rootScopeStore.cqpParallel[lang] = cqp
            }
        })
        $rootScope.$watch(
            "cqpParallel",
            (cqpParallel: Record<string, string>) => {
                // Remove old cqp_ params from the URL
                ;(Object.entries($location.search()) as [keyof HashParams, unknown][]).forEach(([key, value]) => {
                    if (key.startsWith("cqp_")) $location.search(key, null)
                })
                // Set new cqp_ params
                Object.entries(cqpParallel).forEach(([lang, cqp]) => $location.search(`cqp_${lang}`, cqp))
            },
            true
        )

        const service: StoreBase = {
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
