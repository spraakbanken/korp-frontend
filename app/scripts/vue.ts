/** @format */
import angular from "angular"
import TabPreloader from "@/components/TabPreloader.vue"

angular.module("korpApp").directive("tabPreloader", (createVueComponent) => createVueComponent(TabPreloader))
