/** @format */
import angular, { ITimeoutService } from "angular"
import { RootScope } from "@/root-scope.types"
import { isEqual, pick } from "lodash"

export type StoreService = {
    get: <P extends keyof State>(name: P) => State[P]
    set: <P extends keyof State>(name: P, value: State[P]) => void
    patch: <T extends Partial<State>>(partialState: T) => void
    subscribe: (subscriber: SubscribeCallback) => void
    watch: <P extends keyof State>(name: P, callback: WatchCallback<P>) => void
}

export type State = {
    selectedCorpusIds: string[]
}

export type SubscribeCallback = (partialState: Partial<State>) => void
export type WatchCallback<P extends keyof State> = (valueNew: State[P]) => void
type WatchTracker<P extends keyof State> = { name: P; callback: WatchCallback<P> }

const initState = (): State => ({
    selectedCorpusIds: [],
})

angular.module("korpApp").factory("store", [
    "$rootScope",
    "$timeout",
    function ($rootScope: RootScope, $timeout: ITimeoutService): StoreService {
        $rootScope.store = initState()
        const subscribers: SubscribeCallback[] = []
        const watchTrackers: WatchTracker<keyof State>[] = []

        /** Call all subscribers and affected watchers */
        function notify(names: (keyof State)[]): void {
            if (!names.length) return
            const partialState = pick($rootScope.store, names)
            // In next tick
            $timeout(() => {
                subscribers.forEach((callback) => callback(partialState))
                watchTrackers
                    .filter((tracker) => names.includes(tracker.name))
                    .forEach((tracker) => tracker.callback($rootScope.store[tracker.name]))
            })
        }

        /** Is an incoming value different from the stored one? Uses `_.isEqual` to check. */
        function isNew<P extends keyof State>(name: P, value: State[P]): boolean {
            return !isEqual(value, $rootScope.store[name])
        }

        /** Update any number of variables and notify, but only for values that have actually changed. */
        function patch<T extends Partial<State>>(partialState: T): void {
            const names = Object.keys(partialState) as (keyof State)[]
            const namesChanged = names.filter((name) => isNew(name, partialState[name]!))
            namesChanged.forEach((name) => ($rootScope.store[name] = partialState[name]!))
            notify(namesChanged)
        }

        // Placing function bodies here means less repeated typing.
        return {
            get(name) {
                return $rootScope.store[name]
            },

            set(name, value) {
                patch({ [name]: value })
            },

            patch,

            subscribe(subscriber) {
                subscribers.push(subscriber)
            },

            watch(name, callback) {
                watchTrackers.push({ name, callback })
            },
        }
    },
])
