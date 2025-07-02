import { defineStore } from 'pinia'
import { shapeColors, markerSizes, markerColors } from '../markerStyleConfig.js'

export const useMapStore = defineStore('map', {
    state: () => ({
        layers: { layerFIR: false, airspaces: false },
        selectedMarkerType: null,
        activeDrawTool: null,
        drawColor: shapeColors[0],
        airports: [] 
    }),
    actions: {
        toggleLayer(name) { this.layers[name] = !this.layers[name] },
        setMarkerTool(type) { this.selectedMarkerType = type },
        setDrawTool(tool) { this.activeDrawTool = tool },
        setDrawColor(c) { this.drawColor = c },
        cycleDrawColor() {
            const idx = shapeColors.indexOf(this.drawColor)
            const next = shapeColors[(idx + 1) % shapeColors.length]
            this.drawColor = next
        },

        /* Airport helpers */
        toggleAirportVisibility(icao) {
            const a = this._byId(icao); if (a) a.visible = !a.visible
        },
        cycleAirportSize(icao) {
            const order = Object.keys(markerSizes)   // ['smallest','small','medium','large']
            const a = this._byId(icao); if (!a) return
            a.size = order[(order.indexOf(a.size) + 1) % order.length]
        },
        cycleAirportColor(icao) {
            const palette = Object.keys(markerColors)
            const a = this._byId(icao); if (!a) return
            a.color = palette[(palette.indexOf(a.color) + 1) % palette.length]
        },
        toggleTechIssue(icao) { const a = this._byId(icao); if (a) a.techIssue = !a.techIssue },
        toggleStaffIssue(icao) { const a = this._byId(icao); if (a) a.staffIssue = !a.staffIssue },

        /* init helper (called once from AirportListSection) */
        setAirports(list) { this.airports = list },

        /* internal */
        _byId(icao) { return this.airports.find(x => x.icao === icao) }
    }

})


  
