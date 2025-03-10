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
  // Try to extract from HTML first
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const img = doc.querySelector("img");

  // If we found an image with a valid src, use it
  if (
    img?.getAttribute("src") && !img.getAttribute("src")?.startsWith("data:")
  ) {
    return img.getAttribute("src") || "";
  }

  // If the image has a data-src attribute, it might be a lazy-loaded image
  if (img?.getAttribute("data-src")) {
    return img.getAttribute("data-src") || "";
  }

  // Look for the image in the database by constructing a likely path
  // Extract boon name, sanitize it, and construct a path
  const sanitizedBoonName = boonName.replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
  const possibleIconPath = `/images/icons/${godName}_${sanitizedBoonName}.100`;

  // Check if the file exists (this is a client-side fallback)
  const img2 = new Image();
  img2.src = possibleIconPath;
  if (img2.complete) {
    return possibleIconPath;
  }

  // If we still couldn't find a valid image, try a variation
  const alternateIconPath =
    `/images/icons/${godName}_${sanitizedBoonName}_i.100`;
  const img3 = new Image();
  img3.src = alternateIconPath;
  if (img3.complete) {
    return alternateIconPath;
  }

  // If we couldn't find a valid image, generate a placeholder
  return `/images/icons/${godName}_placeholder.png`;
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
    const response = await fetch("/data/boons.json");
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
    <table class="border-collapse bg-neutral-900 text-white">
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
