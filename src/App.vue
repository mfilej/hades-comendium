<script setup lang="ts">
import BoonTable from './components/BoonTable.vue'
</script>

<template>
  <div class="app">
    <header>
      <h1>Hades Boon Compendium</h1>
    </header>
    <main>
      <BoonTable />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  margin-bottom: 2rem;
  text-align: center;
}

h1 {
  color: #42b883;
  font-size: 2.5rem;
  margin: 0;
}
</style>
