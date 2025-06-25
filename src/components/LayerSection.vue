<template>
    <div class="toolbar-section">
      <SectionHeader>Map Layers</SectionHeader>
      <div class="layer-grid">
        <button v-for="(cfg,name) in layerConfig" :key="name"
                :class="['toolbar-btn',{active: layerStates[name]}]"
                @click="toggleLayer(name)">
          {{ cfg.label }}
        </button>
      </div>
    </div>
</template>
  
<script setup>
    import layerConfig from '../layerConfig.js'
    import { useMapStore } from '../stores/mapStore'
    import SectionHeader from './SectionHeader.vue'
    
    const store = useMapStore()
    const layerStates = store.layers      // reactive
    function toggleLayer (name){
        store.toggleLayer(name)             // Pinia
    }
</script>
  
<style scoped>
    .layer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    }
</style>
  