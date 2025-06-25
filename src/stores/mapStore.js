import { defineStore } from 'pinia'
import { shapeColors } from '../markerStyleConfig.js'

export const useMapStore = defineStore('map', {
    state: () => ({
        layers: { layerFIR: false, airspaces: false },
        selectedMarkerType: null,
        activeDrawTool: null,
        drawColor: shapeColors[0]
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
        }
    }
})
