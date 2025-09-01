/** @format */
import angular, { IScope } from "angular"
import { HashParams } from "@/urlparams"
import { ServiceTypes, LocationService } from "@/services/types"

/** Get an Angular service from outside the Angular context. */
export const getService = <K extends keyof ServiceTypes>(name: K): ServiceTypes[K] =>
    angular.element("body").injector().get(name)

/** Wraps `scope.$apply()` to interfere less with the digest cycle (?) */
export const safeApply = <R>(scope: IScope, fn: (scope: IScope) => R): R =>
    scope.$$phase || scope.$root.$$phase ? fn(scope) : scope.$apply(fn)

/** Safely (?) use an Angular service from outside the Angular context. */
export const withService = <K extends keyof ServiceTypes, R>(name: K, fn: (service: ServiceTypes[K]) => R) =>
    safeApply(getService("$rootScope"), () => fn(getService(name)))

/**
 * Get values from the URL search string via Angular.
 * Only use this in code outside Angular. Inside, use `$location.search()`.
 */
export const locationSearchGet = <K extends keyof HashParams>(key: K): HashParams[K] =>
    withService("$location", ($location) => ($location.search() as HashParams)[key])

/**
 * Set values in the URL search string via Angular.
 * Only use this in code outside Angular. Inside, use `$location.search()`.
 */
export const locationSearchSet = <K extends keyof HashParams>(name: K, value: HashParams[K]): LocationService =>
    withService("$location", ($location) => $location.search(name, value))
