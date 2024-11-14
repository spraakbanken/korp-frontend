/** @format */

import angular from "angular"
import { RootScope } from "@/root-scope.types"
import { State, StoreService } from "@/services/store"
import { HashParams, LocationService } from "@/urlparams"

export type HashStoreService = {
    setupSync: <SP extends keyof State, UP extends keyof HashParams>(
        storeName: SP,
        urlName: UP,
        options: {
            toUrl?: (storeValue: State[SP]) => HashParams[UP]
            fromUrl?: (urlValue: HashParams[UP]) => State[SP]
            onChange?: (storeValue: State[SP]) => void
        }
    ) => void
}

angular.module("korpApp").factory("hashStore", [
    "$rootScope",
    "$location",
    "store",
    function ($rootScope: RootScope, $location: LocationService, store: StoreService): HashStoreService {
        // Looks like the typing has to be repeated in order to make SP/UP available in the body
        function setupSync<SP extends keyof State, UP extends keyof HashParams>(
            storeName: SP,
            urlName: UP,
            options: {
                toUrl?: (storeValue: State[SP]) => HashParams[UP]
                fromUrl?: (urlValue: HashParams[UP]) => State[SP]
                onChange?: (storeValue: State[SP]) => void
            }
        ) {
            const toUrl = options.toUrl || ((x) => x as unknown as HashParams[UP])
            const fromUrl = options.fromUrl || ((x) => x as unknown as State[SP])

            /** Sync URL value once to store */
            function syncFromUrl(urlValue: HashParams[UP]) {
                const storeValue = fromUrl(urlValue)
                store.set(storeName, storeValue)
                options.onChange?.(storeValue)
            }

            syncFromUrl($location.search()[urlName])

            // Sync continually from store to URL
            store.watch(storeName, (storeValue) => {
                $location.search(urlName, toUrl(storeValue))
                options.onChange?.(storeValue)
            })

            // Sync continually from URL to store
            $rootScope.$watch(() => $location.search()[urlName], syncFromUrl)
        }

        return {
            setupSync,
        }
    },
])
