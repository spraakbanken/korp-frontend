/** @format */

import angular from "angular"
import { RootScope } from "@/root-scope.types"
import { State, StoreService } from "@/services/store"
import { HashParams, LocationService } from "@/urlparams"

export type HashStoreService = ReturnType<typeof hashStoreFactory>

angular.module("korpApp").factory("hashStore", ["$rootScope", "$location", "store", hashStoreFactory])

function hashStoreFactory($rootScope: RootScope, $location: LocationService, store: StoreService) {
    return {
        setupSync<SP extends keyof State, UP extends keyof HashParams>(
            storeName: SP,
            urlName: UP,
            options: {
                toUrl?: (storeValue: State[SP]) => HashParams[UP]
                fromUrl?: (urlValue: HashParams[UP]) => State[SP]
                // TODO Remove this and replace its usage with store.watch()
                onChange?: (storeValue: State[SP]) => void
            }
        ) {
            const toUrl = options.toUrl || ((x) => x as unknown as HashParams[UP])
            const fromUrl = options.fromUrl || ((x) => x as unknown as State[SP])
            const { onChange } = options

            // Sync once from URL to store
            const storeValue = fromUrl($location.search()[urlName])
            store.set(storeName, storeValue)
            onChange?.(storeValue)

            // Sync continually from store to URL
            store.watch(storeName, (storeValue) => {
                $location.search(urlName, toUrl(storeValue))
                onChange?.(storeValue)
            })

            // Sync continually from URL to store
            $rootScope.$watch(
                () => $location.search()[urlName],
                (urlValue) => {
                    const storeValue = fromUrl(urlValue)
                    store.set(storeName, storeValue)
                    onChange?.(storeValue)
                }
            )
        },
    }
}
