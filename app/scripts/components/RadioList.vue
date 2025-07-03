<!-- @format -->
<script setup lang="ts">
import { locObj } from "@/i18n"
import { store } from "@/vue-services"

export type Option<V = string> = { label: string; value: V }

defineProps<{
    options: Option[]
    value?: string
}>()

defineEmits<{
    (e: "change", value: string): void
}>()
</script>

<template>
    <div role="radiogroup">
        <span v-for="(option, i) in options">
            <span v-if="i > 0" class="text-gray-500 mx-1">|</span>

            <!-- Currently selected option as text -->
            <span v-if="option.value == value" role="radio" aria-checked>{{ locObj(option.label, store.lang) }}</span>

            <!-- Other options as links -->
            <a v-else role="radio" @click="$emit('change', option.value)">
                {{ locObj(option.label, store.lang) }}
            </a>
        </span>
    </div>
</template>
