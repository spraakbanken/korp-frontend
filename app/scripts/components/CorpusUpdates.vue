<!-- @format -->
<script setup>
import { ref } from "vue"
import moment from "moment"
import settings from "@/settings"
import { loc, locObj } from "@/i18n"

// type CorpusUpdatesScope = IScope & {
//     LIMIT: number
//     recentUpdates: CorpusTransformed[] | null
//     recentUpdatesFiltered: CorpusTransformed[] | null
//     expanded: boolean
//     toggleExpanded: (to?: boolean) => void
// }

defineProps(["lang"])

const LIMIT = 5
let recentUpdates = ref()
let recentUpdatesFiltered = ref()
let expanded = ref(false)

if (settings.frontpage?.corpus_updates) {
    const limitDate = moment().subtract(6, "months")
    // Find most recently updated corpora
    recentUpdates.value = settings.corpusListing.corpora
        .filter((corpus) => corpus.info.Updated && moment(corpus.info.Updated).isSameOrAfter(limitDate))
        .sort((a, b) => b.info.Updated.localeCompare(a.info.Updated))
    toggleExpanded(false)
}

function toggleExpanded(to) {
    expanded.value = to != null ? to : !expanded.value
    recentUpdatesFiltered.value = expanded.value ? recentUpdates.value : recentUpdates.value.slice(0, LIMIT)
}
</script>

<template>
    <section v-if="recentUpdates?.length">
        <h2 class="text-xl font-bold">{{ loc("front_corpus_updates", lang) }}</h2>
        <div class="my-2 flex flex-col gap-2">
            <article v-for="corpus in recentUpdatesFiltered">
                <time :datetime="corpus.info.Updated" class="opacity-75 float-right">{{ corpus.info.Updated }}</time>
                <div>
                    <strong>{{ locObj(corpus.title, lang) }}</strong> {{ loc("front_corpus_updated", lang) }}.
                </div>
            </article>
            <div v-if="recentUpdates.length > LIMIT">
                <a v-if="!expanded" @click="toggleExpanded()">
                    <i class="fa fa-angle-double-down"></i> {{ loc("show_more", lang) }}
                </a>
                <a v-if="expanded" @click="toggleExpanded()">
                    <i class="fa fa-angle-double-up"></i> {{ loc("show_less", lang) }}
                </a>
            </div>
        </div>
    </section>
</template>
