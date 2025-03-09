<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

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
const searchQuery = ref('');

// Function to extract image URL from HTML string or generate a placeholder
function extractImageUrl(html: string, godName: string, boonName: string): string {
  // Try to extract from HTML first
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const img = doc.querySelector('img');
  
  // If we found an image with a valid src, use it
  if (img && img.getAttribute('src') && !img.getAttribute('src').startsWith('data:')) {
    return img.getAttribute('src') || '';
  }
  
  // If the image has a data-src attribute, it might be a lazy-loaded image
  if (img && img.getAttribute('data-src')) {
    return img.getAttribute('data-src') || '';
  }
  
  // Look for the image in the database by constructing a likely path
  // Extract boon name, sanitize it, and construct a path
  const sanitizedBoonName = boonName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const possibleIconPath = `/images/icons/${godName}_${sanitizedBoonName}.100`;
  
  // Check if the file exists (this is a client-side fallback)
  const img2 = new Image();
  img2.src = possibleIconPath;
  if (img2.complete) {
    return possibleIconPath;
  }
  
  // If we still couldn't find a valid image, try a variation
  const alternateIconPath = `/images/icons/${godName}_${sanitizedBoonName}_i.100`;
  const img3 = new Image();
  img3.src = alternateIconPath;
  if (img3.complete) {
    return alternateIconPath;
  }
  
  // If we couldn't find a valid image, generate a placeholder
  return `/images/icons/${godName}_placeholder.png`;
}

const filteredBoons = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return boons.value;
  
  return boons.value.filter(boon => 
    boon.name.toLowerCase().includes(query) || 
    boon.god.toLowerCase().includes(query) ||
    boon.description.toLowerCase().includes(query)
  );
});

onMounted(async () => {
  try {
    const response = await fetch('/data/boons.json');
    const data: BoonData[] = await response.json();
    
    // Map database boons to the component's Boon format
    boons.value = data.map(item => {
      // Extract the icon URL from the boon_html, or use a placeholder
      const iconUrl = extractImageUrl(item.boon_html, item.god, item.boon_name);
      
      return {
        god: item.god.charAt(0).toUpperCase() + item.god.slice(1), // Capitalize god name
        name: item.boon_name,
        icon: iconUrl,
        description: item.description, // Keep HTML intact for v-html rendering
        rarity: item.rarity,
        notes: item.notes,
        requires: item.prerequisites
      };
    });
  } catch (error) {
    console.error('Error loading boons:', error);
  }
});
</script>

<template>
  <div class="boon-controls">
    <input 
      v-model="searchQuery"
      type="text"
      placeholder="Search boons..."
      class="search-input"
    />
  </div>

  <div class="boon-table-container">
    <table class="boon-table">
      <thead>
        <tr>
          <th>God</th>
          <th>Boon</th>
          <th>Description</th>
          <th>Rarity</th>
          <th>Requires</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="boon in filteredBoons" :key="`${boon.god}-${boon.name}`">
          <td>{{ boon.god }}</td>
          <td>
            <div class="boon-title">
              <img v-if="boon.icon" :src="boon.icon" :alt="boon.name" class="boon-icon" />
              <span>{{ boon.name }}</span>
            </div>
          </td>
          <td v-html="boon.description" class="boon-description"></td>
          <td v-html="boon.rarity"></td>
          <td v-html="boon.requires"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.boon-controls {
  margin-bottom: 1rem;
}

.search-input {
  padding: 0.5rem;
  width: 100%;
  max-width: 300px;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #666;
}

.boon-table-container {
  width: 100%;
  overflow-x: auto;
  margin: 1rem 0;
}

.boon-table {
  width: 100%;
  border-collapse: collapse;
  background: #1a1a1a;
  color: #ffffff;
}

.boon-table th,
.boon-table td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #333;
}

.boon-table th {
  background: #2a2a2a;
  font-weight: bold;
}

.boon-table tr:hover {
  background: #252525;
}

.boon-description {
  max-width: 300px;
  white-space: normal;
  word-wrap: break-word;
}

/* Style for descriptions with inline icons */
.boon-description img {
  display: inline-flex;
  vertical-align: text-bottom;
  height: 20px; /* Slightly smaller than other images */
  width: auto;
  margin: 0 2px;
  /* Prevent these images from breaking lines */
  flex-shrink: 0;
}

/* Style for icons in the description and other cells */
:deep(.boon-table img) {
  vertical-align: middle;
  margin: 0 2px;
  height: 24px;
  width: auto;
  display: inline-block;
}

/* Display the boon title with icon */
.boon-title {
  display: flex;
  align-items: center;
}

.boon-icon {
  width: 40px !important;
  height: 40px !important;
  margin-right: 10px;
}
</style> 
