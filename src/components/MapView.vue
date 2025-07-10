<template>
  <div id="map"></div>
</template>

<script>
import { useMapStore } from '../stores/mapStore'
import layerConfig from '../layerConfig.js'
import markerConfig from '../markerConfig.js'
import { markerSizes, markerColors } from '../markerStyleConfig.js'
import L from 'leaflet'
import 'leaflet-draw'
import { watch } from 'vue'

export default {
  setup(){
    const store = useMapStore()
    return { store }
  },

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

    // Fetching all the data layers listed in the config file from DAIM server
    for (const [name, config] of Object.entries(layerConfig)) {
      if (name === 'airports') continue // Skipping airports as its loaded in AirportListSection
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

    /* ---- DRAW PLUGINS & MARKER LOGIC ---- */
    const drawnItems = new L.FeatureGroup()
    this.map.addLayer(drawnItems)

    this.drawHandlers.polygon = new L.Draw.Polygon(this.map, {
      allowIntersection: false,
      showArea: false,
      shapeOptions: {
        color: this.store.shapeColor,
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

      // Reset activeDrawTool in the store so Draw button toggles off
      this.store.setDrawTool(null)
    })


    // On Click listener to add Markers/Icons on map
    this.map.on('click', (e) => {

      // Temp code to see coordinates
      console.log('Clicked coordinates:', e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6))

      if (!this.store.selectedMarkerType) return

      const config = markerConfig[this.store.selectedMarkerType]
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

      /* ---- WATCHING PINIA STATE ---- */
      // The Map Layers from Map Layers Section
      watch(
      () => this.store.layers,               // source
      (val) => {
        for (const [name, visible] of Object.entries(val)) {
          this.setLayerVisibility(name, visible)
        }
      },
      { deep: true, immediate: true }
    )

    // The  draw / edit / delete tool Section
    watch(
      () => this.store.activeDrawTool,
      (tool) => {
        this.stopActiveDrawMode()
        if (tool === 'draw')   this.startDrawPolygon()
        if (tool === 'edit')   this.startEditShapes()
        if (tool === 'delete') this.startDeleteShapes()
      },
      { immediate: true }
    )

    watch(
      () => this.store.drawColor,
      (c) => {
        // ① Update the handler’s shape options
        if (this.drawHandlers.polygon) {
          this.drawHandlers.polygon.setOptions({
            shapeOptions: {
              color: c,        // stroke
              fillColor: c,    // interior
              weight: 2,
              fillOpacity: 0.4 // or whatever you like
            }
          })
        }

        // ② If we’re currently in Draw mode, restart it so new shapes use the colour
        if (this.activeDrawMode === 'draw') {
          this.drawHandlers.polygon.disable()
          this.drawHandlers.polygon.enable()
        }
      },
      { immediate: true }
    )

    watch(
      () => this.store.airports,
      list => {
        list.forEach(a => {
          /* get or create marker keyed by ICAO */
          let m = this.dataLayers[a.icao]
          if (!m) {
            m = L.circleMarker([a.lat, a.lon])
            this.dataLayers[a.icao] = m
          }

          /* ----- size & colour look-ups (declare FIRST) ----- */
          const radiusPx = markerSizes[a.size]          // 1, 3, 5, 8 …
          const fillHex  = markerColors[a.color]        // '#888888', '#4CAF50', …

          /* ----- apply colour (stroke + fill) -------------- */
          m.setStyle({
            color: "#333",
            opacity: 0.7,
            fillColor: fillHex,
            fillOpacity: 1
          })

          /* ----- apply radius (circleMarker needs setRadius) */
          if (radiusPx !== undefined) m.setRadius(radiusPx)

          /* issue cues */
          if (a.techIssue) {
            m.setStyle({ dashArray: '4 2', weight: 2 })
          } else if (a.staffIssue) {
            m.setStyle({ dashArray: null, weight: 3 })
          } else {
            m.setStyle({ dashArray: null, weight: 1 })
          }

          /* visibility */
          if (a.visible) {
            m.addTo(this.markerLayerGroup)
          } else {
            this.markerLayerGroup.removeLayer(m)
          }
        })
      },
      { deep: true, immediate: true }
    )

    watch(
      () => this.store.centers,
      list => {
        list.forEach(c => {
          let m = this.dataLayers[c.icao]
          if (!m) {
            m = L.marker([c.lat, c.lon], {
              icon: L.divIcon({ className:'center-icon', iconSize:[12,12] })
            })
            this.dataLayers[c.icao] = m
          }

          /* visibility only (size/colour optional) */
          if (c.visible) {
            m.addTo(this.markerLayerGroup)
          } else {
            this.markerLayerGroup.removeLayer(m)
          }         
        })
      },
      { deep:true, immediate:true }
    )

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
        //console.warn(`Layer '${name}' not loaded yet.`)
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
