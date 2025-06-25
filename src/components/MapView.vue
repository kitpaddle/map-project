<template>
  <div id="map"></div>
</template>

<script>
import layerConfig from '../layerConfig.js'
import markerConfig from '../markerConfig.js'
import { markerSizes, markerColors } from '../markerStyleConfig.js'
import L from 'leaflet'
import 'leaflet-draw'
import { defineExpose } from 'vue'

export default {
  props: ['selectedMarkerType', 'shapeColor'],
  data() {
    return {
      map: null,
      layers: {},
      dataLayers: {}, // for GeoJSON layers
      markerLayerGroup: null, // layer containing all the amrkers
      drawHandlers: {
        polygon: null,
        edit: null,
        delete: null
      },
      activeDrawMode: null
    }
  },
  watch: {
    shapeColor(newColor) {
      if (this.drawHandlers.polygon) {
        this.drawHandlers.polygon.setOptions({
          shapeOptions: {
            color: newColor,
            weight: 2
          }
        })
      }
    }
  },
  mounted() {
    // Setting the map default view
    this.map = L.map('map').setView([60, 18], 6)

    // Creating both base layers
    this.layers = {
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        minZoom: 5,
        attribution: '&copy; OpenStreetMap contributors'
      }),
      whitemap: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        maxZoom: 17,
        minZoom: 5,
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a> & <a href="https://www.openstreetmap.org/copyright">OSM</a> kitpaddle'
      }),
      // Only using this one because it is saved locally
      localtiles: L.tileLayer('/tiles/{z}/{x}/{y}.png', {
        minZoom: 4,
        maxZoom: 8,
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
      })
    }

    // Creating and adding the layer that holds the markers
    this.markerLayerGroup = L.layerGroup().addTo(this.map)

    // Setting current base layer
    this.layers["localtiles"].addTo(this.map)

    // Fetching all the data layers lsited in the config file from DAIM server
    for (const [name, config] of Object.entries(layerConfig)) {
      fetch(config.url)
        .then(res => res.json())
        .then(geojson => {
          
          const options = { ...config }


          const layer = L.geoJSON(geojson, options)

          this.dataLayers[name] = layer
          console.log(`Loaded layer ${name}`, layer) // Log of layer loaded
          // Optional: layer.addTo(this.map) if you want it visible by default
        })
        .catch(err => console.error(`Error loading ${name}:`, err))
    }

    const drawnItems = new L.FeatureGroup()
    this.map.addLayer(drawnItems)

    this.drawHandlers.polygon = new L.Draw.Polygon(this.map, {
      allowIntersection: false,
      showArea: false,
      shapeOptions: {
        color: this.shapeColor,
        weight: 2
      }
    })

    this.drawHandlers.edit = new L.EditToolbar.Edit(this.map, {
      featureGroup: drawnItems
    })

    this.drawHandlers.delete = new L.EditToolbar.Delete(this.map, {
      featureGroup: drawnItems
    })

    const drawControl = new L.Control.Draw({
      edit: { 
        featureGroup: drawnItems,
        edit: false,
        remove: false
      },
      draw: false
    })

    this.map.addControl(drawControl)

    this.map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.addLayer(e.layer)

      // Automatically deactivate the draw tool in parent component
      this.$emit('draw-finished')
    })


    // On Click listener to add Markers/Icons on map
    this.map.on('click', (e) => {

      // Temp code to see coordinates
      console.log('Clicked coordinates:', e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6))

      if (!this.selectedMarkerType) return

      console.log('Map clicked. Marker type:', this.selectedMarkerType)

      const config = markerConfig[this.selectedMarkerType]
      if (!config) return

      let marker

      if (config.icon) {
        const icon = L.icon({
          iconUrl: config.icon,
          iconSize: [40, 40],
          iconAnchor: [20, 20], // center the icon
          popupAnchor: [0, -20]
        })

        marker = L.marker(e.latlng, { icon })
      } else {
        marker = L.circleMarker(e.latlng, {
          radius: 8,
          color: config.color,
          fillColor: config.color,
          fillOpacity: 1
        })
      }

      marker.on('click', (evt) => {
        L.DomEvent.stopPropagation(evt)
        this.markerLayerGroup.removeLayer(marker)
      })

      marker.addTo(this.markerLayerGroup)
    })

    this.$nextTick(() => this.map.invalidateSize())

    // Temp printout of zoom level
    console.log('Initial zoom level:', this.map.getZoom())
    this.map.on('zoomend', () => {
      console.log('Current zoom level:', this.map.getZoom())
    })


  },
  methods: {
    updateMarkerStyle(layer, size, colorKey) {
      const radius = markerSizes[size] || markerSizes.medium
      const color = markerColors[colorKey] || markerColors.gray

      layer.setStyle({
        radius,
        color,
        fillColor: color,
        fillOpacity: 1
      })

      layer._markerStyle = { size, color: colorKey }
    },
    setLayerVisibility(name, visible) {
      const layer = this.dataLayers[name]
      console.log('Toggle request:', name, visible, layer) // Log of layer toggled
      if (!layer) {
        console.warn(`Layer '${name}' not loaded yet.`)
        return
      }
      if (visible) {
        layer.addTo(this.map)
      } else {
        this.map.removeLayer(layer)
      }
    },
    startDrawPolygon() {
      this.stopActiveDrawMode()
      this.drawHandlers.polygon.enable()
      this.activeDrawMode = 'draw'
    },

    startEditShapes() {
      if (this.activeDrawMode === 'edit') {
        this.drawHandlers.edit.disable()
        this.activeDrawMode = null
      } else {
        this.stopActiveDrawMode()
        this.drawHandlers.edit.enable()
        this.activeDrawMode = 'edit'
      }
    },

    startDeleteShapes() {
      if (this.activeDrawMode === 'delete') {
        this.drawHandlers.delete.disable()
        this.activeDrawMode = null
      } else {
        this.stopActiveDrawMode()
        this.drawHandlers.delete.enable()
        this.activeDrawMode = 'delete'
      }
    },

    stopActiveDrawMode() {
      if (this.activeDrawMode === 'draw') this.drawHandlers.polygon.disable()
      else if (this.activeDrawMode === 'edit') this.drawHandlers.edit.disable()
      else if (this.activeDrawMode === 'delete') this.drawHandlers.delete.disable()
      this.activeDrawMode = null
    }
  }

}
</script>

<style>
#map {
  height: 100%;
  width: 100%;
}
</style>
