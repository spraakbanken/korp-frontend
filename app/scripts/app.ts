/** @format */
import _ from "lodash"
import {
    ICacheObject,
    ICompileProvider,
    IComponentOptions,
    ILocaleService,
    ILocationProvider,
    IQService,
    IScope,
    ITimeoutService,
    ui,
} from "angular"
import korpApp from "./korp.module"
import settings from "@/settings"
import statemachine from "@/statemachine"
import * as authenticationProxy from "@/components/auth/auth"
import { initLocales } from "@/data_init"
import { RootScope } from "@/root-scope.types"
import { CorpusTransformed } from "./settings/config-transformed.types"
import { getService, html } from "@/util"
import { loc, locObj } from "@/i18n"
import "@/components/app-header"
import "@/components/searchtabs"
import "@/components/frontpage"
import "@/components/results"
import "@/components/korp-error"
import { JQueryExtended } from "./jquery.types"
import { LocationService } from "./urlparams"
import { LocLangMap } from "@/i18n/types"
import { getAllCorporaInFolders } from "./components/corpus-chooser/util"

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
        tmhDynamicLocaleProvider.localeLocationPattern("translations/angular-locale_{{locale}}.js"),
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
    "$q",
    "$timeout",
    "$uibModal",
    async function (
        $rootScope: RootScope,
        $location: LocationService,
        $locale: ILocaleService,
        tmhDynamicLocale: tmh.tmh.IDynamicLocale,
        tmhDynamicLocaleCache: ICacheObject,
        $q: IQService,
        $timeout: ITimeoutService,
        $uibModal: ui.bootstrap.IModalService
    ) {
        const s = $rootScope

        s.extendedCQP = null
        s.globalFilterData = {}

        /** This deferred is used to signal that the filter feature is ready. */
        s.globalFilterDef = $q.defer<never>()

        // Listen to url changes like #?lang=swe
        s.$on("$locationChangeSuccess", () => {
            // Update current locale. This is async and triggers the "$localeChangeSuccess" event.
            tmhDynamicLocale.set($location.search().lang || settings["default_language"])
        })

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

            // Update global variables
            $rootScope["lang"] = lang

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

        // This fetch was started in data_init.js, but only here can we store the result.
        const initLocalesPromise = initLocales().then((data): void =>
            $rootScope.$apply(() => ($rootScope["loc_data"] = data))
        )

        s.waitForLogin = false

        async function initializeCorpusSelection(selectedIds: string[]): Promise<void> {
            // Resolve any folder ids to the contained corpus ids
            selectedIds = selectedIds.flatMap((id) => getAllCorporaInFolders(settings.folders, id))

            let loginNeededFor: CorpusTransformed[] = []

            for (const corpusId of selectedIds) {
                const corpusObj = settings.corpora[corpusId]
                if (corpusObj && corpusObj.limited_access) {
                    if (!authenticationProxy.hasCredential(corpusId.toUpperCase())) {
                        loginNeededFor.push(corpusObj)
                    }
                }
            }

            const allCorpusIds = settings.corpusListing.corpora.map((corpus) => corpus.id)

            if (settings.initialization_checks && (await settings.initialization_checks(s))) {
                // custom initialization code called
            } else if (_.isEmpty(settings.corpora)) {
                // no corpora
                openErrorModal({
                    content: "<korp-error></korp-error>",
                    resolvable: false,
                })
            } else if (loginNeededFor.length != 0) {
                // check if user has access
                const loginNeededHTML = () =>
                    loginNeededFor.map((corpus) => `<span>${locObj(corpus.title)}</span>`).join(", ")

                if (authenticationProxy.isLoggedIn()) {
                    // access partly or fully denied to selected corpora
                    if (settings.corpusListing.corpora.length == loginNeededFor.length) {
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
                                const neededIds = loginNeededFor.map((corpus) => corpus.id)
                                const filtered = selectedIds.filter((corpusId) => !neededIds.includes(corpusId))
                                const selected = filtered.length ? filtered : settings["preselected_corpora"] || []
                                initializeCorpusSelection(selected)
                            },
                        })
                    }
                } else {
                    // login needed before access can be checked
                    openErrorModal({
                        content: html`<span class="mr-1">{{'login_needed_for_corpora' | loc:$root.lang}}:</span
                            >${loginNeededHTML()}`,
                        onClose: () => {
                            s.waitForLogin = true
                            statemachine.send("LOGIN_NEEDED", { loginNeededFor })
                        },
                    })
                }
            } else if (!selectedIds.every((r) => allCorpusIds.includes(r))) {
                // some corpora missing
                openErrorModal({
                    content: `{{'corpus_not_available' | loc:$root.lang}}`,
                    onClose: () => {
                        const validIds = selectedIds.filter((corpusId) => allCorpusIds.includes(corpusId))
                        const newIds = validIds.length ? validIds : settings["preselected_corpora"] || []
                        initializeCorpusSelection(newIds)
                    },
                })
            } else {
                // here $timeout must be used so that message is not sent before all controllers/componenters are initialized
                settings.corpusListing.select(selectedIds)
                $timeout(() => $rootScope.$broadcast("initialcorpuschooserchange", selectedIds), 0)
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

            const useCustomButton = !_.isEmpty(buttonText)

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

        function getCorporaFromHash(): string[] {
            const corpus = $location.search().corpus
            return corpus ? corpus.split(",") : settings["preselected_corpora"] || []
        }

        statemachine.listen("login", function () {
            if (s.waitForLogin) {
                s.waitForLogin = false
                initializeCorpusSelection(getCorporaFromHash())
            }
        })

        initializeCorpusSelection(getCorporaFromHash())
        await initLocalesPromise
    },
])

korpApp.filter("trust", ["$sce", ($sce) => (input: string) => $sce.trustAsHtml(input)])
// Passing `lang` seems to be necessary to have the string updated when switching language.
// Can fall back on using $rootScope for numbers that will anyway be re-rendered when switching language.
korpApp.filter("prettyNumber", [
    "$rootScope",
    ($rootScope) => (input: string, lang: string) => Number(input).toLocaleString(lang || $rootScope.lang),
])
korpApp.filter("maxLength", () => (val: string) => val.length > 39 ? val.slice(0, 36) + "…" : val)
