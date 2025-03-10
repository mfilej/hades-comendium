<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BoonTableRow from "./BoonTableRow.vue";

const props = defineProps<{
  searchQuery: string;
}>();

interface Boon {
  god: string;
  name: string;
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
  boon_html: string;
  description: string;
  rarity: string;
  notes: string;
  prerequisites: string;
}

const boons = ref<Boon[]>([]);

// Function to extract image URL from HTML string or generate a placeholder
function extractImageUrl(
  html: string,
  godName: string,
  boonName: string,
): string {
  // First try a direct match with the known filename pattern (this is most reliable)
  const sanitizedBoonName = boonName
    .toLowerCase()
    .replace(/'/g, "") // Remove apostrophes completely
    .replace(/[^a-z0-9]/g, "_"); // Replace other non-alphanumeric chars with underscores
    
  // Most icons follow the pattern: godname_boonname_i.100
  const directIconPath = `${import.meta.env.BASE_URL}images/icons/${godName}_${sanitizedBoonName}_i.100`;
  
  // For Aid boons which have special formatting
  if (boonName.includes("Aid")) {
    const aidIconPath = `${import.meta.env.BASE_URL}images/icons/${godName}_${godName}_s_aid_i.100`;
    return aidIconPath;
  }
  
  // For certain boons that might have different patterns (flares, etc.)
  if (boonName.includes("Flare")) {
    const flareIconPath = `${import.meta.env.BASE_URL}images/icons/${godName}_${sanitizedBoonName.replace("flare", "flare_i")}.100`;
    // Return the standard path since this is just trying alternate formatting
    return directIconPath;
  }
  
  // We'll return the most likely path without checking if it exists
  // The browser will use the fallback image if it doesn't load
  return directIconPath;
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
      // Extract the icon URL from the boon_html, or use a placeholder
      const iconUrl = extractImageUrl(item.boon_html, item.god, item.boon_name);

      return {
        god: item.god.charAt(0).toUpperCase() + item.god.slice(1), // Capitalize god name
        name: item.boon_name,
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
