<template>
  <div class="container">
    <div class="map-wrapper">
      <MapView ref="mapView" :selectedBaseLayer="selectedBaseLayer" :selectedMarkerType="selectedMarkerType" />
    </div>
    <div class="sidebar">
      <div class="sidebar-header">
        <h1 class="main-title">LFV - SAM</h1>
        <h2 class="sub-title">Situational Awareness Map</h2>
      </div>
      <Toolbar :selectedBaseLayer="selectedBaseLayer" :layerStates="layerStates"
        :selectedMarkerType="selectedMarkerType" @changeLayer="selectedBaseLayer = $event" @toggleLayer="toggleLayer"
        @toggleMarkerTool="toggleMarkerTool" />
    </div>
  </div>
</template>


<script>
import Toolbar from './components/Toolbar.vue'
import MapView from './components/MapView.vue'

export default {
  components: { Toolbar, MapView },
  data() {
    return {
      selectedBaseLayer: 'whitemap', // sets the intial Base Layer
      // Contains the layers and if they are shown or not
      layerStates: {
        layerFIR: false,
        airspaces: false
      },
      selectedMarkerType: null  // Sets the selected marker type, null as default
    }
  },
  methods: {
    toggleLayer(name) {
      this.layerStates[name] = !this.layerStates[name]
      this.$refs.mapView.setLayerVisibility(name, this.layerStates[name])
    },
    toggleMarkerTool(type) {
    this.selectedMarkerType = type
    }
  }
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}

.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
}

.sidebar {
  width: 250px;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100%;
  background-color: #1e1e1e;
}

.map-wrapper {
  flex-grow: 1;
  height: 100%;
}

.sidebar-header {
  text-align: center;
  padding: 20px 10px;
  color: white;
  border-bottom: 1px solid #444;
}

.main-title {
  font-size: 40px;
  margin: 0;
  padding: 0;
}

.sub-title {
  font-size: 15px;
  margin: 4px 0 0;
  color: #cccccc;
}
</style>
