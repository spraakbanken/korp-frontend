<!-- @format -->
<script setup lang="ts">
defineProps<{ progress?: number }>()
</script>

<template>
    <div role="progressbar" :aria-valuenow="progress || 0">
        <div
            v-if="progress !== null"
            class="h-0.5 bg-current absolute bottom-0 left-0 transition-all"
            :style="{ width: `${progress || 0}%` }"
        ></div>
        <i class="fa-solid fa-spinner motion-safe:animate-spin-slow"></i>
    </div>
</template>
