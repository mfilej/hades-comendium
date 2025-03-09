<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <input 
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    type="text"
    placeholder="Search boons..."
    class="w-full max-w-[300px] p-2 bg-neutral-800 border border-neutral-600 text-white rounded text-base focus:outline-none focus:border-neutral-500"
  />
</template> 
