/** @format */
import angular from "angular"
import { ngVueComponent } from "@jaredmcateer/ngvue3"
import TabPreloader from "@/components/TabPreloader.vue"

angular.module("korpApp").directive(...ngVueComponent("tabPreloader", TabPreloader))
