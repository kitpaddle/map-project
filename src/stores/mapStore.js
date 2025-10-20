import { defineStore } from 'pinia'
import { shapeColors, markerSizes, markerColors } from '../markerStyleConfig.js'

export const useMapStore = defineStore('map', {
    state: () => ({
        layers: { },
        selectedMarkerType: null,
        activeDrawTool: null,
        drawColor: shapeColors[0],
        airports: [],
        centers: [],
        offices: []
    }),
    actions: {

        toggleLayer(name) { this.layers[name] = !this.layers[name] },
        setMarkerTool(type) { this.selectedMarkerType = type },
        setDrawTool(tool) { this.activeDrawTool = tool },
        setDrawColor(c) { this.drawColor = c },

        /* AIRPORT ACTIONS */
        cycleDrawColor() {
            const idx = shapeColors.indexOf(this.drawColor)
            const next = shapeColors[(idx + 1) % shapeColors.length]
            this.drawColor = next
        },

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
        toggleAirportTechIssue(icao) { const a = this._byId(icao); if (a) a.techIssue = !a.techIssue },
        toggleAirportStaffIssue(icao) { const a = this._byId(icao); if (a) a.staffIssue = !a.staffIssue },

        /* CENTER ACTIONS */
        toggleCenterVisibility(icao) {
            const c = this._byIdC(icao); if (c) c.visible = !c.visible;
        },
        cycleCenterSize(icao) { 
            const order = Object.keys(markerSizes)
            const c = this._byIdC(icao); if (!c) return
            c.size = order[(order.indexOf(c.size) + 1) % order.length]
         },
        cycleCenterColor(icao) { 
            const palette = Object.keys(markerColors)
            const c = this._byIdC(icao); if (!c) return
            c.color = palette[(palette.indexOf(c.color) + 1) % palette.length]
         },
        toggleCenterTechIssue(icao) { const c = this._byIdC(icao); if (c) c.techIssue = !c.techIssue },
        toggleCenterStaffIssue(icao) { const c = this._byIdC(icao); if (c) c.staffIssue = !c.staffIssue },

        /* OFFICE ACTIONS */
        toggleOfficeVisibility(id) { const o = this._byIdO(id); if (o) o.visible = !o.visible },
        cycleOfficeSize(id) {
            const order = Object.keys(markerSizes)
            const o = this._byIdO(id); if (!o) return
            o.size = order[(order.indexOf(o.size) + 1) % order.length]
        },
        cycleOfficeColor(id) {
            const palette = Object.keys(markerColors)
            const o = this._byIdO(id); if (!o) return
            o.color = palette[(palette.indexOf(o.color) + 1) % palette.length]
        },
        toggleOfficeTechIssue(id) { const o = this._byIdO(id); if (o) o.techIssue = !o.techIssue },
        toggleOfficeStaffIssue(id) { const o = this._byIdO(id); if (o) o.staffIssue = !o.staffIssue },

        /* init helper (called once) */
        setAirports(list) { this.airports = list },
        setCenters(list) { this.centers = list },
        setOffices(list) { this.offices = list },

        /* internal */
        _byId(icao) { return this.airports.find(x => x.icao === icao) },
        _byIdC(icao) { return this.centers.find(x => x.icao === icao) },
        _byIdO(icao) { return this.offices.find(x => x.icao === icao) }
    }

})


  
