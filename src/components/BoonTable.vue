<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Boon {
  god: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
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

onMounted(async () => {
  try {
    const response = await fetch('/data/boons.json');
    const data: BoonData[] = await response.json();
    
    // Map database boons to the component's Boon format
    boons.value = data.map(item => {
      // Extract boon type from description (e.g., Attack, Special, Cast, etc.)
      const typeMatch = item.description.match(/<b>([^<]+)<\/b>/);
      const type = typeMatch ? typeMatch[1] : '';
      
      return {
        god: item.god,
        name: item.boon_name,
        description: item.description, // Keep HTML intact for v-html rendering
        type: type,
        rarity: 'Common to Heroic', // Simplified for now
        requires: item.prerequisites ? 'Yes' : ''
      };
    });
  } catch (error) {
    console.error('Error loading boons:', error);
  }
});
</script>

<template>
  <div class="boon-table-container">
    <table class="boon-table">
      <thead>
        <tr>
          <th>God</th>
          <th>Boon</th>
          <th>Description</th>
          <th>Type</th>
          <th>Rarity</th>
          <th>Requires</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="boon in boons" :key="`${boon.god}-${boon.name}`">
          <td>{{ boon.god }}</td>
          <td>{{ boon.name }}</td>
          <td v-html="boon.description"></td>
          <td>{{ boon.type }}</td>
          <td>{{ boon.rarity }}</td>
          <td>{{ boon.requires }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
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

.boon-table td:nth-child(3) {
  max-width: 300px;
}
</style> 
