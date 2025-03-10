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
    placeholder="Search..."
    class="w-[150px] h-[20px] py-0 px-1 bg-neutral-800 border border-neutral-700 text-white rounded-sm text-xs focus:outline-none focus:border-neutral-500"
  />
</template> 
