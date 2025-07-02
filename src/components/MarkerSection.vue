<template>
    <div class="toolbar-section">
      <SectionHeader>MARKERS</SectionHeader>
      <div class="marker-grid">
        <button v-for="(cfg,type) in markerCfg" :key="type"
          :class="['toolbar-btn', { active: store.selectedMarkerType === type },
          cfg.icon ? 'icon-button' : '']"
                @click="toggle(type)">
          <img v-if="cfg.icon" :src="cfg.icon" :alt="cfg.label" />
          <span v-else>{{ cfg.label }}</span>
        </button>
      </div>
    </div>
</template>
  
<script setup>
    import markerCfg from '../markerConfig.js'
    import { useMapStore } from '../stores/mapStore'
    import SectionHeader from './SectionHeader.vue'
    const store = useMapStore()
    function toggle (type){
        const newType = store.selectedMarkerType===type ? null : type
        store.setMarkerTool(newType)
        store.setDrawTool(null)
    }
</script>

<style scoped>

.marker-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

/* icon-only buttons just need centering */
.icon-button {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* tidy up the image */
.icon-button img {
  width: 25px;
  height: 25px;
  object-fit: contain;
  filter: drop-shadow(0 0 2px black);
}

</style>
  