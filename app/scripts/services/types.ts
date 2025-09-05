import { IControllerService, IHttpService, ui, ILocationService } from "angular"
import { RootScope } from "@/root-scope.types"
import { StoreService } from "./store.types"
import { HashParams } from "@/urlparams"

/** Mapping from service names to their TS types. */
export type ServiceTypes = {
    $controller: IControllerService
    $http: IHttpService
    $location: LocationService
    $rootScope: RootScope
    $uibModal: ui.bootstrap.IModalService
    store: StoreService
}
/** Extends the Angular Location service to assign types for supported URL hash params. */

export type LocationService = Omit<ILocationService, "search"> & {
    search(): HashParams
    search(search: HashParams): LocationService
    search<K extends keyof HashParams>(search: K, paramValue: HashParams[K] | any): LocationService
}
