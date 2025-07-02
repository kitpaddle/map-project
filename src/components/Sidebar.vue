<template>
    <div class="sidebar-grid">
      <!-- Left column -->
      <div class="col">
        <LayerSection />
        <MarkerSection />
        <DrawSection />
      </div>
  
      <!-- Right column -->
      <div class="col">
        <AirportListSection />
      </div>
    </div>
  </template>
  
  <script setup>
  import LayerSection       from './LayerSection.vue'
  import MarkerSection      from './MarkerSection.vue'
  import DrawSection        from './DrawSection.vue'
  import AirportListSection from './AirportListSection.vue'
  </script>
  
  <style scoped>
  /* === 2-column grid === */
  .sidebar-grid {
    display: grid;
    grid-template-columns: 90px 1fr;   /* two equal-width columns */
    gap: 8px;                         /* space between columns */
    height: 100%;                     /* fill sidebar height */
    padding: 4px;                     /* inner margin */
    box-sizing: border-box;
  }
  
  /* every column stacks its sections vertically */
  .col {
    display: flex;
    flex-direction: column;
    gap: 4px;                         /* space between sections */
    overflow-y: auto;                 /* independent scroll if needed */
  }
  </style>
  