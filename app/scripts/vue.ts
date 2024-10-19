/** @format */
import angular from "angular"
import { ngVueComponent } from "@jaredmcateer/ngvue3"
import CorpusUpdates from "@/components/CorpusUpdates.vue"
import TabPreloader from "@/components/TabPreloader.vue"

angular
    .module("korpApp")
    .directive(...ngVueComponent("corpusUpdates", CorpusUpdates))
    .directive(...ngVueComponent("tabPreloader", TabPreloader))
