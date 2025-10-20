<template>
  <div id="map" ref="mapContainer"></div>

  <!-- dim the map while exporting -->
  <div v-show="exportBusy" class="map-overlay"></div>

  <!-- floating export button -->
  <button class="export-btn"
          :disabled="exportBusy"
          @click="exportPng">
    <span v-if="exportBusy">
      <span class="spinner"></span>
      Exporting…
    </span>
    <span v-else>
      ⤓ Download Map
    </span>
  </button>
</template>

<script>
import { useMapStore } from '../stores/mapStore'
import layerConfig from '../layerConfig.js'
import markerConfig from '../markerConfig.js'
import { markerSizes, markerColors } from '../markerStyleConfig.js'
import L from 'leaflet'
import 'leaflet-draw'
import 'leaflet-polylinedecorator'
import { watch } from 'vue'
import html2canvas from 'html2canvas'

const DEFAULT_ICON_SIZE = 40;

/* Function used to draw rectangles on map for icons */
function buildCenterIcon(center) {
  /* ------------ size calculations ------------ */
  const baseRadius = markerSizes[center.size] ?? 8;      // fall-back radius
  const sidePx     = baseRadius * 6;                    // rectangle width
  const heightPx   = sidePx / 1.6;                       // banner height
  const fontPx     = Math.round(sidePx * 0.4);           // label font size

  const fillHex = markerColors[center.color] ?? '#ffbf00';

  // SVG / DIV icon
  const html = `
    <div class="center-icon"
         style="
           width:${sidePx}px;
           height:${heightPx}px;
           background:${fillHex};
           font-size:${fontPx}px;">
      ${center.icao}
    </div>`;

  return L.divIcon({
    html,
    className: '',                 // prevent Leaflet default styles
    iconSize : [sidePx, heightPx]
  });
}

function buildOfficeIcon(o) {
  const r      = markerSizes[o.size] ?? 8;                 // your size scale
  const box    = Math.max(22, Math.round(r * 6));          // bump as you like (6→7 for bigger)
  const fill   = markerColors[o.color] ?? '#888';          // building tint
  const stroke = 'rgba(0,0,0,.35)';                        // subtle outline
  const roof   = _lightenHex(fill, 0.18);
  const accent = _lightenHex(fill, 0.28);
  const door   = _darkenHex(fill, 0.35);
  const sw     = (box/24) * 0.9;                           // scale stroke width
  const label  = (o.icao || '').toUpperCase().slice(0, 8); // keep it tidy (fits 3–8 chars well)

  const svg = `
  <svg viewBox="0 0 24 24" width="${box}" height="${box}"
       xmlns="http://www.w3.org/2000/svg" style="display:block">
    <!-- ground shadow (no blur; html2canvas-safe) -->
    <ellipse cx="12" cy="21" rx="6.8" ry="1.4" fill="black" opacity="0.22"/>

    <!-- taller building body -->
    <rect x="6" y="4.8" width="12" height="13.6" rx="2.2"
          fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>

    <!-- roof band -->
    <rect x="6.6" y="5.4" width="10.8" height="1.6" rx="0.8" fill="${roof}" opacity="0.95"/>

    <!-- side accent -->
    <rect x="7.2" y="7" width="1.6" height="10" rx="0.8" fill="${accent}" opacity="0.9"/>

    <!-- 2×3 windows -->
    <g fill="white" opacity="0.96">
      <rect x="9.0"  y="7.2"  width="2.2" height="1.9" rx="0.4"/>
      <rect x="12.8" y="7.2"  width="2.2" height="1.9" rx="0.4"/>
      <rect x="9.0"  y="10.1" width="2.2" height="1.9" rx="0.4"/>
      <rect x="12.8" y="10.1" width="2.2" height="1.9" rx="0.4"/>
      <rect x="9.0"  y="13.0" width="2.2" height="1.9" rx="0.4"/>
      <rect x="12.8" y="13.0" width="2.2" height="1.9" rx="0.4"/>
    </g>

    <!-- door + knob -->
    <rect x="10.7" y="15.9" width="2.6" height="2.9" rx="0.5" fill="${door}"/>
    <circle cx="12.8" cy="17.3" r="0.25" fill="white" opacity="0.9"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [box, box],
    // If you want it to “sit” on the point, use bottom anchoring:
    // iconAnchor: [box/2, box*0.88],
    iconAnchor: [box/2, box/2]
  });
}



/* helpers (keep one copy; if you already added _darkenHex, don't duplicate) */
function _darkenHex(hex, amt=0.3) {
  const n = hex.replace('#','');
  const num = parseInt(n.length===3 ? n.split('').map(c=>c+c).join('') : n, 16);
  const r = Math.max(0, ((num>>16)&255) * (1-amt));
  const g = Math.max(0, ((num>>8)&255)  * (1-amt));
  const b = Math.max(0, (num&255)       * (1-amt));
  const to2 = v => v.toString(16).padStart(2,'0');
  return `#${to2(r|0)}${to2(g|0)}${to2(b|0)}`;
}
function _lightenHex(hex, amt=0.2) {
  const n = hex.replace('#','');
  const num = parseInt(n.length===3 ? n.split('').map(c=>c+c).join('') : n, 16);
  const r = Math.min(255, ((num>>16)&255) + 255*amt);
  const g = Math.min(255, ((num>>8)&255)  + 255*amt);
  const b = Math.min(255, (num&255)       + 255*amt);
  const to2 = v => v.toString(16).padStart(2,'0');
  return `#${to2(r|0)}${to2(g|0)}${to2(b|0)}`;
}


/*
function buildOfficeIcon(office) {
  const baseRadius = markerSizes[office.size] ?? 8
  const sidePx     = baseRadius * 6
  const heightPx   = sidePx / 1.6
  const fontPx     = Math.round(sidePx * 0.4)
  const fillHex    = markerColors[office.color] ?? '#ffbf00'

  const html = `
    <div class="office-icon"
         style="
           width:${sidePx}px;
           height:${heightPx}px;
           background:${fillHex};
           font-size:${fontPx}px;">
      ${office.icao}
    </div>`

  return L.divIcon({ html, className:'', iconSize:[sidePx, heightPx] })
}*/


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
        polyline: null,
        edit: null,
        delete: null
      },
      activeDrawMode: null,
      badgeLayers: {},
      exportBusy: false
    }
  },
  mounted() {
    // Setting the map default view
    this.canvasRenderer = L.canvas();     // one shared renderer
    this.map = L.map('map', { preferCanvas: true }).setView([60, 18], 6)
    
    const tileRoot = import.meta.env.BASE_URL + 'tiles/{z}/{x}/{y}.png'

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
      localtiles: L.tileLayer(tileRoot, {
        minZoom: 4,
        maxZoom: 8,
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        crossOrigin: 'anonymous'
      })
    }

    // Creating and adding the layer that holds the markers
    this.markerLayerGroup = L.layerGroup().addTo(this.map)

    // Setting current base layer
    this.layers["localtiles"].addTo(this.map)

    

    // Fetching all the data layers listed in the config file from DAIM server
    for (const [name, config] of Object.entries(layerConfig)) {
      if (name === 'airports') continue // Skipping airports as its loaded in AirportListSection
      const layersUrl = import.meta.env.BASE_URL + config.url
      fetch(layersUrl)
        .then(res => res.json())
        .then(geojson => {
          const options = { ...config , renderer: this.canvasRenderer}
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
        color: this.store.drawColor,
        weight: 2
      }
    })

    
    this.drawHandlers.polyline = new L.Draw.Polyline(this.map, {
      shapeOptions: { color: this.store.drawColor, weight: 3 }
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

      if (e.layerType === 'polyline') {
        const color = this.store.drawColor
        const deco = L.polylineDecorator(e.layer, {
          patterns: [{
            offset: '100%', repeat: 0,
            symbol: L.Symbol.arrowHead({
              pixelSize: 28, polygon: true,
              pathOptions: { color, fillColor: color, fillOpacity: 1, weight: 1, interactive: true }
            })
          }]
        })
        // keep a reference so edits/deletes can update it
        e.layer._arrowDecorator = deco
        deco.addTo(this.map)

        // live-update the arrowhead while vertices are dragged
        const onEdit = () => {
          if (e.layer._arrowDecorator) {
            e.layer._arrowDecorator.setPaths(e.layer) // rebind path to the edited line
          }
        }
        e.layer.on('edit', onEdit)
        e.layer._onEditArrowSync = onEdit
      }

      // Reset activeDrawTool in the store so Draw button toggles off
      this.store.setDrawTool(null)
    })

    drawnItems.on('layerremove', (ev) => {
      const line = ev.layer
      if (!line) return
      if (line._onEditArrowSync) {
        line.off('edit', line._onEditArrowSync)
        delete line._onEditArrowSync
      }
      if (line._arrowDecorator) {
        this.map.removeLayer(line._arrowDecorator)
        delete line._arrowDecorator
      }
    })

    this.map.on('draw:deleted', (evt) => {
      evt.layers.eachLayer((layer) => {
        if (layer._onEditArrowSync) {
          layer.off('edit', layer._onEditArrowSync)
          delete layer._onEditArrowSync
        }
        if (layer._arrowDecorator) {
          this.map.removeLayer(layer._arrowDecorator)
          delete layer._arrowDecorator
        }
      })
    })

    this.map.on('draw:deletestart', () => {
      drawnItems.eachLayer((line) => {
        if (line._arrowDecorator && !line._arrowDecorator._onDeleteClick) {
          const deco = line._arrowDecorator
          deco._onDeleteClick = () => {
            // remove the head first
            if (line._arrowDecorator) {
              this.map.removeLayer(line._arrowDecorator)
              delete line._arrowDecorator
            }
            if (line._onEditArrowSync) {
              line.off('edit', line._onEditArrowSync)
              delete line._onEditArrowSync
            }
            // then remove the line (triggers drawnItems 'layerremove' too)
            drawnItems.removeLayer(line)
          }
          deco.on('click', deco._onDeleteClick)
        }
      })
    })

    // Clean up the temporary click handlers when Delete mode ends
    this.map.on('draw:deletestop', () => {
      drawnItems.eachLayer((line) => {
        if (line._arrowDecorator && line._arrowDecorator._onDeleteClick) {
          const deco = line._arrowDecorator
          deco.off('click', deco._onDeleteClick)
          delete deco._onDeleteClick
        }
      })
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
          iconSize: [DEFAULT_ICON_SIZE, DEFAULT_ICON_SIZE],
          iconAnchor: [DEFAULT_ICON_SIZE / 2, DEFAULT_ICON_SIZE / 2], // center the icon
          popupAnchor: [0, - DEFAULT_ICON_SIZE / 2]
        })

        marker = L.marker(e.latlng, { icon })
      } else {
        marker = L.circleMarker(e.latlng, {
          radius: 8,
          color: config.color,
          fillColor: config.color,
          fillOpacity: 1,
          renderer: this.canvasRenderer
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

    // The  draw / polyline / edit / delete tool Section
    watch(
      () => this.store.activeDrawTool,
      (tool) => {
        this.stopActiveDrawMode()
        if (tool === 'draw')   this.startDrawPolygon()
        if (tool === 'edit')   this.startEditShapes()
        if (tool === 'delete') this.startDeleteShapes()
        if (tool === 'arrowline') this.startDrawPolyline()
      },
      { immediate: true }
    )

    // watch for drawColor
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

        if (this.drawHandlers.polyline) {
          this.drawHandlers.polyline.setOptions({ 
            shapeOptions: { 
              color: c, 
              weight: 3 
            }
          })
        }

        // ② If we’re currently in Draw mode, restart it so new shapes use the colour
        if (this.activeDrawMode === 'draw') {
          this.drawHandlers.polygon.disable()
          this.drawHandlers.polygon.enable()
        }
        
        if (this.activeDrawMode === 'polyline') {
          this.drawHandlers.polyline.disable(); 
          this.drawHandlers.polyline.enable()
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

          /* Issues Icons */
          this.toggleBadge([a.lat, a.lon], `${a.icao}_maint`, 'maint', radiusPx, 0, a.techIssue)
          this.toggleBadge([a.lat, a.lon], `${a.icao}_staff`, 'staff', radiusPx, 0, a.staffIssue)

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
            m = L.marker([c.lat, c.lon], { zIndexOffset:1000 })
            this.dataLayers[c.icao] = m
          }

          /* always refresh icon so size / colour / text update */
          m.setIcon( buildCenterIcon(c) )

          /* visibility only (size/colour optional) */
          if (c.visible) {
            m.addTo(this.markerLayerGroup)
          } else {
            this.markerLayerGroup.removeLayer(m)
          }

          /* radius for badge-anchor */
          const radiusPx = markerSizes[c.size] ?? 8
          
          /* Issues Icons */
          this.toggleBadge([c.lat, c.lon], `${c.icao}_maint`, 'maint', radiusPx, 15,  c.techIssue)
          this.toggleBadge([c.lat, c.lon], `${c.icao}_staff`, 'staff', radiusPx, 15, c.staffIssue)
          
        })
      },
      { deep:true, immediate:true }
    )

    watch(
      () => this.store.offices,
      list => {
        list.forEach(o => {
          let m = this.dataLayers[o.icao]
          if (!m) {
            m = L.marker([o.lat, o.lon], { zIndexOffset: 900 })
            this.dataLayers[o.icao] = m
          }

          // always refresh icon so size/colour/label update
          m.setIcon(buildOfficeIcon(o))

          // visibility
          if (o.visible) {
            m.addTo(this.markerLayerGroup)
          } else {
            this.markerLayerGroup.removeLayer(m)
          }

          // badges (reuse same helper + assets)
          const radiusPx = markerSizes[o.size] ?? 8
          this.toggleBadge([o.lat, o.lon], `${o.icao}_maint`, 'maint', radiusPx, 10, o.techIssue)
          this.toggleBadge([o.lat, o.lon], `${o.icao}_staff`, 'staff', radiusPx, 10, o.staffIssue)
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

        // Also remove the issues icons
        const prefix = name + '_'
        Object.entries(this.badgeLayers).forEach(([key, mk]) => {
          if (key.startsWith(prefix)) {
            this.markerLayerGroup.removeLayer(mk)
          }
        })
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

    startDrawPolyline() {
      this.stopActiveDrawMode()
      this.drawHandlers.polyline.enable()
      this.activeDrawMode = 'polyline'
    },

    stopActiveDrawMode() {
      if (this.activeDrawMode === 'draw') this.drawHandlers.polygon.disable()
      else if (this.activeDrawMode === 'polyline') this.drawHandlers.polyline.disable()
      else if (this.activeDrawMode === 'edit') this.drawHandlers.edit.disable()
      else if (this.activeDrawMode === 'delete') this.drawHandlers.delete.disable()
      this.activeDrawMode = null
    },

    toggleBadge(latlng, key, type, radiusPx, offsetRight, show) {
      let m = this.badgeLayers[key]

      if (show && !m) {
        m = L.marker(latlng, {
          icon         : buildBadgeIcon(type, radiusPx, offsetRight),
          interactive  : false,
          zIndexOffset : 1500
        })
        this.badgeLayers[key] = m
      }

      if (show && m) {
        m.setIcon(buildBadgeIcon(type, radiusPx, offsetRight))
      }

      if (show)   m.addTo(this.markerLayerGroup)
      else if (m) this.markerLayerGroup.removeLayer(m)
    },

    async captureView () {
      // (optional) hide Leaflet controls in the shot
      const ctrls = Array.from(
        this.map.getContainer().querySelectorAll('.leaflet-control')
      );
      ctrls.forEach(el => el.style.visibility = 'hidden');

      const canvas  = await html2canvas(this.map.getContainer(), {
        useCORS   : true,       // tiles are served with  crossOrigin:'anonymous'
        allowTaint: false
      });

      ctrls.forEach(el => el.style.visibility = '');

      return canvas.toDataURL('image/png');
    },

    /* ---------------------------------------------
    *  export a full-height map at zoom-6
    * --------------------------------------------- */
    async exportPng () {
      if (this.exportBusy) return;        // debounce double-clicks
        this.exportBusy = true;             // ⇐ disable & show spinner
        try {
          const ZOOM       = 6;
          const BOUNDS     = [[71.5, 5.5], [51.5, 30.0]];     // [N-W , S-E]
          const OVERLAP_PX = 0;                              // smooth seams
          const WAIT_MS    = 800;                             // before & after
          const wait       = ms => new Promise(r => setTimeout(r, ms));

          /* remember user view */
          const restore = { ctr: this.map.getCenter(), zoom: this.map.getZoom() };
          console.log("Initiating Screenshot at zoom " + ZOOM)

          /* 1 ▸ jump to centre of bounds @ z-6, let tiles load */
          this.map.setView(
            [(BOUNDS[0][0]+BOUNDS[1][0])/2,
            (BOUNDS[0][1]+BOUNDS[1][1])/2],
            ZOOM,
            { animate:false }
          );
          await wait(WAIT_MS);

          /* 2 ▸ shift so viewport-TOP aligns with north edge */
          const v        = this.map.getBounds();
          const halfSpan = (v.getNorth() - v.getSouth()) / 2;
          const topCtr   = L.latLng(BOUNDS[0][0] - halfSpan, this.map.getCenter().lng);

          this.map.setView(topCtr, ZOOM, { animate:false });
          await wait(WAIT_MS);

          /* 3 ▸ capture / scroll loop */
          const strips = [];
          while (true) {
            strips.push(await this.captureView());              // --- shot
            console.log(' Taking screenshot');

            const b   = this.map.getBounds();
            if (b.getSouth() <= BOUNDS[1][0]) break;            // south edge reached

            // pan down: full screen-height minus the overlap
            const dy = this.map.getSize().y - OVERLAP_PX;
            this.map.panBy([0, dy], { animate:false });
            console.log("Paning down to continue screenshot")
            await wait(WAIT_MS);
          }

          /* 4 ▸ stitch vertically in one canvas */
          console.log("Finished all screenshots. Stitching them together")
          const imgs = await Promise.all(strips.map(src => new Promise(res => {
            const im = new Image();
            im.onload = () => res(im);
            im.src    = src;
          })));

          const W       = imgs[0].width;
          const totalH  = imgs.reduce((h, im, i) =>
                            h + (i ? im.height - OVERLAP_PX : im.height), 0);

          const cvs = document.createElement('canvas');
          cvs.width  = W;  cvs.height = totalH;
          const ctx  = cvs.getContext('2d');

          let y = 0;
          imgs.forEach((im, i) => {
            ctx.drawImage(im, 0, y);
            y += (i ? im.height - OVERLAP_PX : im.height);
          });
          console.log("Downloading picture")
          cvs.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a   = Object.assign(document.createElement('a'),
                                      { href:url, download:'sam-map-export.png' });
            a.click();
            URL.revokeObjectURL(url);
          }, 'image/png', 0.92);

          /* 5 ▸ restore user view */
          await wait(WAIT_MS);
          this.map.setView(restore.ctr, restore.zoom, { animate:false });
        } finally {
          this.exportBusy = false;
        }
    }


  }

}

/* ------------------------------------------------------------------ */
/*  buildBadgeIcon(type, r)                                           */
/*  type = 'maint' | 'staff'                                          */
/*  r    = pixel radius of the main circle-marker (6, 8, 12 …)        */
/* ------------------------------------------------------------------ */
import maintPng     from '../assets/icons/icon_maintenance.png'
import personnelPng from '../assets/icons/icon_personnel.png'

const _badgeCache = new Map()

function buildBadgeIcon(type, r, offsetRight) {
  const key = `${type}_${r}_${offsetRight}`
  if (_badgeCache.has(key)) return _badgeCache.get(key)

  const ICON_SIZE = 12        // width & height of the PNG
  const GAP       = 4         // gap between badge & marker edge

  /* desired offset of the BADGE-centre *from the marker centre* */
  const dx = r + GAP + offsetRight     // always to the right
  const dy = type === 'maint'
           ?  -10 + GAP                   // down  → lower-right
           :  2 + GAP                 // up    → upper-right

  /* Leaflet maths:  anchor = [ax, ay] where
       (ICON_SIZE/2 - ax, ICON_SIZE/2 - ay)  ==  (dx, dy)           */
  const ax = ICON_SIZE/2 - dx
  const ay = ICON_SIZE/2 - dy

  const icon = L.icon({
    iconUrl   : type === 'maint' ? maintPng : personnelPng,
    iconSize  : [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ax, ay],
    className : `badge-${type}`
  })

  _badgeCache.set(key, icon)
  return icon
}

</script>

<style>
#map {
  height: 100%;
  width: 100%;
}

.export-btn {
  position:absolute; bottom:10px; left:10px;
  padding:6px 10px;
  background:#ff9800;          /* orange brand colour */
  color:#fff; border:none; border-radius:4px;
  font-weight:600; cursor:pointer;
  box-shadow:0 0 6px rgba(0,0,0,.35);
  transition:background .2s ease;
  z-index: 2000; 
}
.export-btn:hover { background:#ffa726; }

.spinner{
  width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;
  border-radius:50%;display:inline-block;animation:spin .8s linear infinite;
  vertical-align:middle
}
@keyframes spin{to{transform:rotate(360deg)}}
.export-btn[disabled]{opacity:.6;cursor:not-allowed}

/* overlay dims the whole screen and blocks clicks */
.map-overlay{
  position:fixed;          /* covers the viewport, no wrapper needed  */
  top:0;left:0;width:100%;height:100%;
  background:rgba(0,0,0,.35);
  z-index:1800;            /* below the button (2000) but above #map */
}

</style>
