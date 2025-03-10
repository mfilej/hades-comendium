<script setup lang="ts">
import BoonTable from "./components/BoonTable.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-black">
    <header
      class="h-6 flex items-center justify-between px-2 bg-neutral-900 border-b border-neutral-700"
    >
      <h1
        class="text-[0.7rem] font-bold uppercase tracking-wider text-[#42b883]"
      >
        Hades Compendium
      </h1>
      <div id="search-container"></div>
    </header>
    <main class="flex-1 overflow-hidden p-0">
      <BoonTable />
    </main>
  </div>
</template>
