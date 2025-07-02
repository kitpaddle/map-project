<template>
  <div class="container">
    <div class="map-wrapper">
      <MapView ref="mapView" />
    </div>
    <div class="sidebar">
      <Sidebar />
    </div>
  </div>
</template>


<script>
import Sidebar from './components/Sidebar.vue'
import MapView from './components/MapView.vue'

export default {
  components: { Sidebar, MapView },
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
  width: auto;
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
