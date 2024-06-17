/** @format */
import { IRootScopeService } from "angular"

export function createStore<S extends State>(name: string, init: () => S) {
    return [
        "$rootScope",
        function ($rootScope: RootScopeWithStore) {
            // Ensure store container exists.
            if (!$rootScope["_store"]) {
                $rootScope._store = {}
            }

            $rootScope._store[name] = init()

            return {
                /** Return current state. */
                get: () => $rootScope._store[name],
                watch: <T>(member: keyof S, f: (newVal: T, oldVal: T) => void) =>
                    $rootScope.$watch(`_store.${name}.${String(member)}`, f),
            }
        },
    ]
}

type RootScopeWithStore = IRootScopeService & {
    _store: Record<string, State>
}

export type State = Record<string, any>
