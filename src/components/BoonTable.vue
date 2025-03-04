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

const boons = ref<Boon[]>([]);

onMounted(async () => {
  try {
    const response = await fetch('/combined-boons.html');
    const html = await response.text();
    
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get all rows except the header
    const rows = Array.from(doc.querySelectorAll('body>table>tbody>tr')).slice(1);
    
    // Parse each row into a Boon object
    boons.value = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      return {
        god: cells[0]?.textContent || '',
        name: cells[1]?.textContent || '',
        description: cells[2]?.textContent || '',
        type: cells[3]?.textContent || '',
        rarity: cells[4]?.textContent || '',
        requires: cells[5]?.textContent || ''
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
          <td>{{ boon.description }}</td>
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
