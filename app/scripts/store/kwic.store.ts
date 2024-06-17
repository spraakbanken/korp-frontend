/** @format */
import angular, { IRootScopeService } from "angular"

type KwicState = State & {
    /** Number of total search hits, updated when a search is completed. */
    hits?: number
}

const initialState: () => KwicState = () => ({
    hits: undefined,
})

angular.module("korpApp").factory("kwicStore", [
    "$rootScope",
    function ($rootScope: RootScopeWithStore) {
        // Ensure store container exists.
        if (!$rootScope["_store"]) {
            $rootScope._store = {}
        }

        $rootScope._store.kwic = initialState()

        return {
            /** Return current state. */
            get: () => $rootScope._store.kwic,
            watch: <T>(member: keyof KwicState, f: (newVal: T, oldVal: T) => void) =>
                $rootScope.$watch(`_store.kwic.${member}`, f),
        }
    },
])

type RootScopeWithStore = IRootScopeService & {
    _store: Record<string, State>
}

type State = Record<string, any>
