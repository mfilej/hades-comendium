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
  <tr class="hover:bg-neutral-800">
    <td class="p-3 text-left border border-neutral-700">{{ boon.god }}</td>
    <td class="p-3 text-left border border-neutral-700">
      <div class="flex items-center">
        <img 
          v-if="boon.icon" 
          :src="boon.icon" 
          :alt="boon.name" 
          class="w-[50px] h-[50px] mr-[10px]"
        />
        <span>{{ boon.name }}</span>
      </div>
    </td>
    <td 
      v-html="boon.description" 
      class="p-3 text-left border border-neutral-700 max-w-[300px] break-words"
    />
    <td 
      v-html="boon.rarity" 
      class="p-3 text-left border border-neutral-700"
    />
    <td 
      v-html="boon.requires" 
      class="p-3 text-left border border-neutral-700"
    />
  </tr>
</template>

 
