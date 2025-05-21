<template>
  <div id="map"></div>
</template>

<script>
import layerConfig from '../layerConfig.js'
import markerConfig from '../markerConfig.js'
import { markerSizes, markerColors } from '../markerStyleConfig.js'
import L from 'leaflet'
import 'leaflet-draw'

export default {
  props: ['selectedBaseLayer', 'selectedMarkerType'],
  data() {
    return {
      map: null,
      layers: {},
      currentBaseLayer: null,
      dataLayers: {}, // for GeoJSON layers
      markerLayerGroup: null // layer containing all the amrkers
    }
  },
  watch: {
    selectedBaseLayer(newLayer) {
      if (this.currentBaseLayer) {
        this.map.removeLayer(this.currentBaseLayer)
      }
      this.currentBaseLayer = this.layers[newLayer]
      this.currentBaseLayer.addTo(this.map)
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
      })
    }

    // Creating and adding the layer that holds the markers
    this.markerLayerGroup = L.layerGroup().addTo(this.map)

    // Setting current base layer
    this.currentBaseLayer = this.layers[this.selectedBaseLayer].addTo(this.map)

    // Fetching all the data layers lsited in the config file from DAIM server
    for (const [name, config] of Object.entries(layerConfig)) {
      fetch(config.url)
        .then(res => res.json())
        .then(geojson => {
          
          const options = { ...config }

          // Conditionally attach popup logic
          if (config.popupEnabled) {
            options.onEachFeature = (feature, leafletLayer) => {
              this.attachAirportPopup(feature, leafletLayer)
            }
          }

          const layer = L.geoJSON(geojson, options)

          this.dataLayers[name] = layer
          console.log(`Loaded layer ${name}`, layer) // Log of layer loaded
          // Optional: layer.addTo(this.map) if you want it visible by default
        })
        .catch(err => console.error(`Error loading ${name}:`, err))
    }

    const drawnItems = new L.FeatureGroup()
    this.map.addLayer(drawnItems)

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: true,
        rectangle: true,
        marker: true,
        circle: false,
        polyline: false
      }
    })

    this.map.addControl(drawControl)

    this.map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.addLayer(e.layer)
    })

    // On Click listener to add Markers/Icons on map
    this.map.on('click', (e) => {
      if (!this.selectedMarkerType) return

      console.log('Map clicked. Marker type:', this.selectedMarkerType)

      const config = markerConfig[this.selectedMarkerType]
      if (!config) return

      const marker = L.circleMarker(e.latlng, {
        radius: 8,
        color: config.color,
        fillColor: config.color,
        fillOpacity: 1
      })

      marker.on('click', (evt) => {
        L.DomEvent.stopPropagation(evt)
        this.markerLayerGroup.removeLayer(marker)
      })

      marker.addTo(this.markerLayerGroup)
    })


    this.$nextTick(() => this.map.invalidateSize())
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
    attachAirportPopup(feature, layer) {
      const code = feature.properties.POSITIONINDICATOR || 'Unknown'
      const loc = feature.properties.LOCATION || 'Unnamed'

      //layer._markerStyle = { size: 'medium', color: 'gray' }

      const colorButtons = Object.entries(markerColors).map(([key, hex]) => {
        return `<span class="circle-option" data-color="${key}" style="background-color:${hex};"></span>`
      }).join('')

      const sizeButtons = Object.entries(markerSizes).map(([key, radius]) => {
        const px = radius * 2
        return `<span class="circle-option" data-size="${key}" style="width:${px}px;height:${px}px;"></span>`
      }).join('')

      const popupHTML = `
        <div>
          <strong>${code} - ${loc}</strong><br/>
          <div style="margin-top: 6px;">Size: ${sizeButtons}</div>
          <div style="margin-top: 6px;">Color: ${colorButtons}</div>
        </div>
      `


      layer.bindTooltip(`${code} - ${loc}`, {
        direction: 'top',
        offset: [0, -5]
      })

      layer.bindPopup(popupHTML)

      layer.on('popupopen', (e) => {
        const popupEl = e.popup.getElement()
        if (!popupEl) return

        // Size buttons
        popupEl.querySelectorAll('.circle-option[data-size]').forEach(el => {
          el.style.display = 'inline-block'
          el.style.margin = '0 4px'
          el.style.borderRadius = '50%'
          el.style.backgroundColor = '#ccc'
          el.style.cursor = 'pointer'
          el.addEventListener('click', () => {
            const size = el.getAttribute('data-size')
            this.updateMarkerStyle(layer, size, layer._markerStyle?.color || 'gray')
            layer._markerStyle.size = size
          })
        })

        // Color buttons
        popupEl.querySelectorAll('.circle-option[data-color]').forEach(el => {
          el.style.display = 'inline-block'
          el.style.width = '16px'
          el.style.height = '16px'
          el.style.margin = '0 4px'
          el.style.borderRadius = '50%'
          el.style.cursor = 'pointer'
          el.addEventListener('click', () => {
            const color = el.getAttribute('data-color')
            this.updateMarkerStyle(layer, layer._markerStyle?.size || 'medium', color)
            layer._markerStyle.color = color
          })
        })
      })
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
