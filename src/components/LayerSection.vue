<template>
  <div class="toolbar-section">
    <SectionHeader>LAYERS</SectionHeader>

    <div class="layer-grid">
      <!-- menuLayers: only layers meant to be shown -->
      <button
        v-for="([name, cfg]) in menuLayers"
        :key="name"
        :class="['toolbar-btn', { active: layerStates[name] }]"
        @click="toggleLayer(name)"
      >
        {{ cfg.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import layerConfig      from '../layerConfig.js'
import { useMapStore }  from '../stores/mapStore'
import SectionHeader    from './SectionHeader.vue'

const store       = useMapStore()
const layerStates = store.layers                    // reactive

/* keep only layers without the flag, or flag !== false */
const menuLayers = Object.entries(layerConfig).filter(
  ([, cfg]) => cfg.showInMenu !== false
)

function toggleLayer(name) {
  store.toggleLayer(name)
}
</script>

<style scoped>
.layer-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 4px;
}
</style>
