<!-- @format -->
<script setup lang="ts">
import { computed, ref } from "vue"
import moment from "moment"
import settings from "@/settings"
import { loc, locObj } from "@/i18n"
import { rootScope } from "@/vue-services"
import { CorpusTransformed } from "@/settings/config-transformed.types"

const LIMIT = 5
const lang = ref<string>(rootScope.lang)
const recentUpdates = ref<CorpusTransformed[]>([])
const expanded = ref(false)

const recentUpdatesFiltered = computed(() => recentUpdates.value.slice(0, expanded.value ? undefined : LIMIT))

rootScope.$watch("lang", (value: string) => (lang.value = value))

if (settings.frontpage?.corpus_updates) {
    const limitDate = moment().subtract(6, "months")
    // Find most recently updated corpora
    recentUpdates.value = settings.corpusListing.corpora
        .filter((corpus) => corpus.info.Updated && moment(corpus.info.Updated).isSameOrAfter(limitDate))
        .sort((a, b) => b.info.Updated!.localeCompare(a.info.Updated!))
}

function selectCorpus(corpusId: string) {
    settings.corpusListing.select([corpusId])
    rootScope.$broadcast("corpuschooserchange", [corpusId])
}
</script>

<template>
    <section v-if="recentUpdates?.length">
        <h2 class="text-xl font-bold">{{ loc("front_corpus_updates", lang) }}</h2>
        <div class="my-2 flex flex-col gap-2">
            <article v-for="corpus in recentUpdatesFiltered">
                <time :datetime="corpus.info.Updated" class="opacity-75 float-right">{{ corpus.info.Updated }}</time>
                <div>
                    <strong>{{ locObj(corpus.title, lang) }}</strong>
                    {{ loc("front_corpus_updated", lang) }}.
                    <button class="btn btn-xs btn-default" @click="selectCorpus(corpus.id)">
                        {{ loc("toggle_select") }}
                    </button>
                </div>
            </article>
            <div v-if="recentUpdates.length > LIMIT">
                <a v-if="!expanded" @click="expanded = true">
                    <i class="fa fa-angle-double-down"></i> {{ loc("show_more_n", lang) }}
                </a>
                <a v-if="expanded" @click="expanded = false">
                    <i class="fa fa-angle-double-up"></i> {{ loc("show_less_n", lang) }}
                </a>
            </div>
        </div>
    </section>
</template>
