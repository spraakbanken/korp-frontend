/** @format */
import { isEmpty } from "lodash"
import {
    ICacheObject,
    ICompileProvider,
    IComponentOptions,
    ILocaleService,
    ILocationProvider,
    IScope,
    ui,
} from "angular"
import korpApp from "./korp.module"
import settings from "@/settings"
import statemachine from "@/statemachine"
import * as authenticationProxy from "@/components/auth/auth"
import { getLocData } from "@/loc-data"
import { RootScope } from "@/root-scope.types"
import { CorpusTransformed } from "./settings/config-transformed.types"
import { BUILD_HASH, formatRelativeHits, html } from "@/util"
import { getService, LocationService } from "@/angular-util"
import { loc, locObj } from "@/i18n"
import "@/components/app-header"
import "@/components/searchtabs"
import "@/components/frontpage"
import "@/components/results"
import "@/components/korp-error"
import "@/services/store"
import { StoreService } from "@/services/store"
import { JQueryExtended } from "./jquery.types"
import { LocLangMap } from "@/i18n/types"
import { getAllCorporaInFolders } from "@/corpus-chooser"

// Catch unhandled exceptions within Angular, see https://docs.angularjs.org/api/ng/service/$exceptionHandler
korpApp.factory("$exceptionHandler", [
    function () {
        return (exception: Error) => {
            // Also log it to make the stack trace available
            console.error(exception)

            // Cannot inject services normally here, because it creates circular dependencies
            const $uibModal = getService("$uibModal")
            const $rootScope = getService("$rootScope")

            const scope = $rootScope.$new() as IScope & { message: string }
            scope.message = String(exception)

            const modal = $uibModal.open({
                template: html`<div class="modal-body">
                        <korp-error message="{{message}}"></korp-error>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" ng-click="$close()">{{'modal_close' | loc:$root.lang}}</button>
                    </div>`,
                scope: scope,
            })
            // Dismissing the modal rejects the `result` promise. Catch it to avoid a "Possibly unhandled rejection" error.
            modal.result.catch(() => {})
        }
    },
])

// load all custom components
let customComponents: Record<string, IComponentOptions> = {}

try {
    customComponents = require("custom/components.js").default
} catch (error) {
    console.log("No module for components available")
}
for (const componentName in customComponents) {
    korpApp.component(componentName, customComponents[componentName])
}

korpApp.filter("loc", () => loc)
korpApp.filter("locObj", () => locObj)
korpApp.filter(
    "replaceEmpty",
    () =>
        <T>(input: T) =>
            input === "" ? "–" : input
)

authenticationProxy.initAngular(korpApp)

/**
 * angular-dynamic-locale updates translations in the builtin $locale service, which is used
 * by at least the datepicker in angular-ui-bootstrap.
 */
korpApp.config([
    "tmhDynamicLocaleProvider",
    (tmhDynamicLocaleProvider: tmh.tmh.IDynamicLocaleProvider) =>
        tmhDynamicLocaleProvider.localeLocationPattern(`translations/angular-locale_{{locale}}.${BUILD_HASH}.js`),
])

korpApp.config([
    "$uibTooltipProvider",
    ($uibTooltipProvider: ui.bootstrap.ITooltipProvider) =>
        $uibTooltipProvider.options({
            appendToBody: true,
        }),
])

/**
 * Makes the hashPrefix "" instead of "!" which means our URL:s are ?mode=test#?lang=eng
 * instead of ?mode=test#!?lang=eng
 */
korpApp.config(["$locationProvider", ($locationProvider: ILocationProvider) => $locationProvider.hashPrefix("")])

/**
 * "blob" must be added to the trusted URL:s, otherwise downloading KWIC and statistics etc. will not work
 */
korpApp.config([
    "$compileProvider",
    ($compileProvider: ICompileProvider) =>
        $compileProvider.aHrefSanitizationTrustedUrlList(/^\s*(https?|ftp|mailto|tel|file|blob):/),
])

korpApp.run([
    "$rootScope",
    "$location",
    "$locale",
    "tmhDynamicLocale",
    "tmhDynamicLocaleCache",
    "$uibModal",
    "store",
    async function (
        $rootScope: RootScope,
        $location: LocationService,
        $locale: ILocaleService,
        tmhDynamicLocale: tmh.tmh.IDynamicLocale,
        tmhDynamicLocaleCache: ICacheObject,
        $uibModal: ui.bootstrap.IModalService,
        store: StoreService
    ) {
        const s = $rootScope

        // Sync stored lang to current locale. This is async and triggers the "$localeChangeSuccess" event.
        store.watch("lang", (lang) => tmhDynamicLocale.set(lang))

        // Listen to change of current language
        s.$on("$localeChangeSuccess", () => {
            // The fresh info in $locale only has the 2-letter code, not the 3-letter code that we use
            // Find the configured 3-letter UI language matching the new 2-letter locale
            const lang = settings.languages
                .map((language) => language.value)
                .find((lang3) => tmhDynamicLocaleCache.get<ILocaleService>(lang3)?.id == $locale.id)

            if (!lang) {
                console.warn(`No locale matching "${$locale.id}"`)
                return
            }

            // Trigger jQuery Localize
            ;($("body") as JQueryExtended).localize()
        })

        $(document).keyup(function (event) {
            if (event.keyCode === 27) {
                $rootScope.$broadcast("abort_requests")
            }
        })

        $rootScope.kwicTabs = []
        $rootScope.compareTabs = []
        $rootScope.graphTabs = []
        $rootScope.mapTabs = []
        $rootScope.textTabs = []

        /** Whether initial corpus selection is deferred because it depends on authentication. */
        let waitForLogin = false

        async function initializeCorpusSelection(ids: string[], skipLogin?: boolean): Promise<void> {
            if (!ids || ids.length == 0) ids = settings["preselected_corpora"] || []

            // Resolve any folder ids to the contained corpus ids
            ids = ids.flatMap((id) => getAllCorporaInFolders(settings.folders, id))

            const hasAccess = (corpus: CorpusTransformed) => authenticationProxy.hasCredential(corpus.id.toUpperCase())

            const deniedCorpora = ids
                .map((id) => settings.corpora[id])
                .filter((corpus) => corpus?.limited_access && !hasAccess(corpus))

            const allowedIds = ids.filter((id) => !deniedCorpora.find((corpus) => corpus.id == id))

            const allCorpusIds = settings.corpusListing.corpora.map((corpus) => corpus.id)

            if (settings.initialization_checks && (await settings.initialization_checks())) {
                // custom initialization code called
            } else if (isEmpty(settings.corpora)) {
                // no corpora
                openErrorModal({
                    content: "<korp-error></korp-error>",
                    resolvable: false,
                })
            } else if (deniedCorpora.length != 0) {
                // check if user has access
                const loginNeededHTML = () =>
                    deniedCorpora.map((corpus) => `<span>${locObj(corpus.title)}</span>`).join(", ")

                if (authenticationProxy.isLoggedIn()) {
                    // access partly or fully denied to selected corpora
                    if (settings.corpusListing.corpora.length == deniedCorpora.length) {
                        openErrorModal({
                            content: "{{'access_denied' | loc:$root.lang}}",
                            buttonText: "go_to_start",
                            onClose: () => {
                                window.location.href = window.location.href.split("?")[0]
                            },
                        })
                    } else {
                        openErrorModal({
                            content: html`<div>{{'access_partly_denied' | loc:$root.lang}}:</div>
                                <div>${loginNeededHTML()}</div>
                                <div>{{'access_partly_denied_continue' | loc:$root.lang}}</div>`,
                            onClose: () => {
                                initializeCorpusSelection(allowedIds)
                            },
                        })
                    }
                } else if (!skipLogin) {
                    // login needed before access can be checked
                    openErrorModal({
                        content: html`<span class="mr-1">{{'login_needed_for_corpora' | loc:$root.lang}}:</span
                            >${loginNeededHTML()}`,
                        onClose: () => {
                            waitForLogin = true
                            statemachine.send("LOGIN_NEEDED", { loginNeededFor: deniedCorpora })
                        },
                    })
                } else {
                    // Login dismissed, fall back to allowed corpora
                    initializeCorpusSelection(allowedIds)
                }
            } else if (!ids.every((r) => allCorpusIds.includes(r))) {
                // some corpora missing
                openErrorModal({
                    content: `{{'corpus_not_available' | loc:$root.lang}}`,
                    onClose: () => {
                        const validIds = ids.filter((corpusId) => allCorpusIds.includes(corpusId))
                        initializeCorpusSelection(validIds)
                    },
                })
            } else {
                // Corpus selection OK
                store.corpus = ids
                settings.corpusListing.select(store.corpus)

                // Sync corpus selection from store to global corpus listing
                store.watch("corpus", () => {
                    // In parallel mode, the select function may also add hidden corpora.
                    settings.corpusListing.select(store.corpus)
                })
            }
        }

        // TODO the top bar could show even though the modal is open,
        // thus allowing switching modes or language when an error has occured.
        type ErrorModalOptions = {
            content: string
            resolvable?: boolean
            onClose?: () => void
            buttonText?: string
            translations?: LocLangMap
        }
        function openErrorModal({ content, resolvable = true, onClose, buttonText, translations }: ErrorModalOptions) {
            type ModalScope = IScope & {
                translations?: LocLangMap
                closeModal: () => void
            }
            const s = $rootScope.$new(true) as ModalScope

            const useCustomButton = !isEmpty(buttonText)

            const modal = $uibModal.open({
                template: html` <div class="modal-body" ng-class="{'mt-10' : resolvable }">
                    <div>${content}</div>
                    <div class="ml-auto mr-0 w-fit">
                        <button
                            ng-if="${resolvable}"
                            ng-click="closeModal()"
                            class="btn bg-blue-500 text-white font-bold mt-3"
                        >
                            <span ng-if="${useCustomButton}">{{'${buttonText}' | loc:$root.lang }}</span>
                            <span ng-if="!${useCustomButton}">OK</span>
                        </button>
                    </div>
                </div>`,
                scope: s,
                size: "md",
                // Prevent backdrop click if not resolvable
                backdrop: resolvable || "static",
                keyboard: false,
            })
            modal.result.catch(() => onClose?.())

            s.translations = translations

            s.closeModal = () => {
                if (onClose && resolvable) {
                    modal.close()
                    onClose()
                }
            }
        }

        const getCorporaFromHash = (): string[] => {
            const value = $location.search().corpus
            return value ? value.split(",") : []
        }

        initializeCorpusSelection(getCorporaFromHash())

        // Retry initialization after login
        statemachine.listen("login", () => {
            if (!waitForLogin) return
            waitForLogin = false
            initializeCorpusSelection(getCorporaFromHash())
        })

        // Retry intialization after dismissing login
        statemachine.listen("logout", () => {
            if (!waitForLogin) return
            waitForLogin = false
            initializeCorpusSelection(getCorporaFromHash(), true)
        })

        await getLocData()
    },
])

korpApp.filter("trust", ["$sce", ($sce) => (input: string) => $sce.trustAsHtml(input)])
// Passing `lang` seems to be necessary to have the string updated when switching language.
// Can fall back on using store for numbers that will anyway be re-rendered when switching language.
korpApp.filter("prettyNumber", [
    "store",
    (store) => (input: string, lang?: string) => Number(input).toLocaleString(lang || store.lang),
])
korpApp.filter("formatRelativeHits", [
    "store",
    (store) => (input: string, lang?: string) => formatRelativeHits(input, lang || store.lang),
])
korpApp.filter("maxLength", () => (val: unknown) => String(val).length > 39 ? String(val).slice(0, 36) + "…" : val)
