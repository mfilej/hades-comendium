<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BoonTableRow from "./BoonTableRow.vue";

const props = defineProps<{
  searchQuery: string;
}>();

interface Boon {
  god: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  rarity: string;
  notes: string;
  requires: string;
}

interface BoonData {
  id: number;
  god: string;
  row_idx: number;
  boon_name: string;
  slug: string;
  boon_html: string;
  description: string;
  rarity: string;
  notes: string;
  prerequisites: string;
}

const boons = ref<Boon[]>([]);

// Function to generate icon URL from slug
function getIconUrl(godName: string, slug: string): string {
  // Use our standardized naming convention
  const iconPath = `${import.meta.env.BASE_URL}images/icons/${godName}_${slug}_icon.100`;
  
  // Return the path - if it doesn't exist, we'll handle the error in the component
  return iconPath;
}

const filteredBoons = computed(() => {
  const query = props.searchQuery.toLowerCase().trim();
  if (!query) return boons.value;

  return boons.value.filter((boon) =>
    boon.name.toLowerCase().includes(query) ||
    boon.god.toLowerCase().includes(query) ||
    boon.description.toLowerCase().includes(query)
  );
});

onMounted(async () => {
  try {
    // Use import.meta.env.BASE_URL to get the configured base path
    const response = await fetch(`${import.meta.env.BASE_URL}data/boons.json`);
    const data: BoonData[] = await response.json();

    // Map database boons to the component's Boon format
    boons.value = data.map((item) => {
      // Generate the icon URL based on the slug
      const iconUrl = getIconUrl(item.god, item.slug);

      return {
        god: item.god.charAt(0).toUpperCase() + item.god.slice(1), // Capitalize god name
        name: item.boon_name,
        slug: item.slug,
        icon: iconUrl,
        description: item.description,
        rarity: item.rarity,
        notes: item.notes,
        requires: item.prerequisites,
      };
    });
  } catch (error) {
    console.error("Error loading boons:", error);
  }
});
</script>

<template>
  <div class="h-full w-full overflow-auto p-0 bg-black">
    <table class="w-full border-collapse bg-neutral-900 text-white table-fixed">
      <tbody>
        <BoonTableRow
          v-for="boon in filteredBoons"
          :key="`${boon.god}-${boon.name}`"
          :boon="boon"
        />
      </tbody>
    </table>
  </div>
</template>
