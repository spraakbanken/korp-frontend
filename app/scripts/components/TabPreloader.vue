<!-- @format -->
<script setup>
defineProps(["progress"])
</script>

<template>
    <div>
        <div
            v-if="progress != null"
            class="h-0.5 bg-current absolute bottom-0 left-0"
            :style="{ width: `${progress || 0}%` }"
        ></div>
        <i class="fa-solid fa-spinner motion-safe:animate-spin-slow"></i>
    </div>
</template>
