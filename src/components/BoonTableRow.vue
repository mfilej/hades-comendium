<script setup lang="ts">
interface Boon {
  god: string;
  name: string;
  icon: string;
  description: string;
  rarity: string;
  notes: string;
  requires: string;
}

defineProps<{
  boon: Boon;
}>();
</script>

<template>
  <tr class="hover:bg-neutral-800 border-b border-neutral-700">
    <td class="p-1 text-left text-xs border-r border-neutral-700">
      <img
        v-if="boon.icon"
        :src="boon.icon"
        :alt="boon.name"
        class="w-[32px] h-[32px]"
      />
      <span class="sr-only">{{ boon.god }}</span>
    </td>
    <td class="p-1 text-left border-r border-neutral-700 text-xs">
      {{ boon.name }}
    </td>
    <td
      v-html="boon.description"
      class="p-1 text-left border-r border-neutral-700 break-words text-xs"
    />
    <td
      v-html="boon.rarity"
      class="p-1 text-left border-r border-neutral-700 text-xs"
    />
    <td
      v-html="boon.requires"
      class="p-1 text-left text-xs"
    />
  </tr>
</template>

<style>
/* Style for images in boon description cells */
td[v-html] img {
  display: inline-flex !important;
  vertical-align: middle !important;
  height: 18px !important;
  width: auto !important;
  margin: 0 1px !important;
}
</style>
