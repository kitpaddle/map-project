<template>
  <div class="toolbar">
    <!-- Map Controls Section -->
    <div class="toolbar-section">
      <h3 class="section-title">Map Background</h3>
      <div class="radio-buttons">
        <button :class="['radio-button', { active: selectedBaseLayer === 'whitemap' }]"
          @click="$emit('changeLayer', 'whitemap')">
          Simple Map
        </button>
        <button :class="['radio-button', { active: selectedBaseLayer === 'osm' }]" @click="$emit('changeLayer', 'osm')">
          Open Street Map
        </button>
      </div>
    </div>

    <!-- Map Layers Section -->
    <div class="toolbar-section">
      <h3 class="section-title">Map Layers</h3>
      <div class="layer-grid">
        <button v-for="(config, name) in layerConfig" :key="name"
          :class="['layer-button', { active: layerStates[name] }]" @click="$emit('toggleLayer', name)">
          {{ config.label }}
        </button>
      </div>
    </div>

    <!-- Market Tool Section -->
    <div class="toolbar-section">
      <h3 class="section-title">Marker Tools</h3>
      <div class="marker-grid">
        <button v-for="(config, type) in markerTypes" :key="type"
          :class="['marker-button', { active: selectedMarkerType === type, 'icon-button': !!config.icon }]"
          @click="toggleMarkerTool(type)">
          <img v-if="config.icon" :src="config.icon" :alt="config.label" />
          <span v-else>{{ config.label }}</span>
        </button>
      </div>
    </div>

    <!-- Drawing Tools Section -->
    <div class="toolbar-section">
      <h3 class="section-title">Drawing Shapes</h3>
      <div class="draw-buttons-row">
        <button :class="{ active: activeDrawTool === 'draw' }"
          @click="$emit('toggleDrawTool', activeDrawTool === 'draw' ? null : 'draw')">Draw</button>

        <button :class="{ active: activeDrawTool === 'edit' }"
          @click="$emit('toggleDrawTool', activeDrawTool === 'edit' ? null : 'edit')">Edit</button>

        <button :class="{ active: activeDrawTool === 'delete' }"
          @click="$emit('toggleDrawTool', activeDrawTool === 'delete' ? null : 'delete')">Delete</button>

        <button :style="{ backgroundColor: activeShapeColor + '33' }" @click="$emit('cycleShapeColor')">Color</button>
      </div>
    </div>

  </div>

</template>


<script>
import layerConfig from '../layerConfig.js'
import markerConfig from '../markerConfig.js'

export default {
  props: ['selectedBaseLayer', 'layerStates', 'selectedMarkerType', 'activeDrawTool', 'activeShapeColor'],
  emits: ['changeLayer', 'toggleLayer', 'toggleMarkerTool', 'toggleDrawTool', 'cycleShapeColor'],
  data() {
    return {
      layerConfig,
      markerTypes: markerConfig
    }
  },
  methods: {
    toggleMarkerTool(type) {
      const newType = this.selectedMarkerType === type ? null : type
      this.$emit('toggleMarkerTool', newType)
    },
    handleDrawToggle(tool) {
      this.$emit('toggleDrawTool', tool === this.activeDrawTool ? null : tool)
    }
  }
}
</script>


<style>
button {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
button:focus {
  outline: none;
}
button:hover {
  /* dark orange */
  box-shadow: 0 0 4px #d2691e;
}

.toolbar {
  width: 250px;
  box-sizing: border-box;
  color: white;
  background-color: #1e1e1e;
}

.toolbar-section {
  border-bottom: 1px solid #444;
  padding: 0px 5px 10px 5px
  
}

.section-title {
  margin: 0;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}

/* Background layer buttons*/
.radio-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.radio-button {
  font-size: 13px;
  width: 100%;
  padding: 2px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.radio-button.active {
  background-color: #ac8132;
}

/* Grid of layer buttons for the layers */
.layer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.layer-button {
  font-size: 13px;
  padding: 10px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.layer-button.active {
  background-color: #ac8132;;
}

/* Grid of marker buttons for the icons*/
.marker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

/* Marker buttons */
.marker-button {
  width: 100%;
  padding: 10px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.marker-button.active {
  background-color: #d2691e;
  /* dark orange */
}

.marker-button.icon-button {
  display: flex;
  justify-content: center;
  align-items: center;
}

.marker-button.icon-button img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: drop-shadow(0 0 2px black);
}

/* Draw buttons */
.draw-buttons-row {
  display: flex;
  flex-direction: row;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.draw-buttons-row button {
  flex: 1;
  padding: 8px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.draw-buttons-row button.active {
  background-color: #ac8132;
}

.draw-buttons-row button:hover {
  background-color: #444;
}
</style>
