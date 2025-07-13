<script setup>
import { onMounted, computed, ref } from 'vue'
import { useMapStore } from '../stores/mapStore'
import layerConfig from '../layerConfig.js'
import AirportRow from './AirportRow.vue'
import SectionHeader from './SectionHeader.vue'

const store = useMapStore()

/* load once */
onMounted(async () => {

    // Loading all AIRPORT data once (filtering and organising into PINIA)

    if (store.airports.length) return     // already loaded once

    const url = import.meta.env.BASE_URL + layerConfig.airports.url
    const allow = layerConfig.airports.filterList
    const geo   = await fetch(url).then(r=>r.json())

    const rows = geo.features
    .filter(f => !allow.length || allow.includes(f.properties.POSITIONINDICATOR))
    .map(f => ({
        icao: f.properties.POSITIONINDICATOR,
        name: f.properties.LOCATION,
        lat : f.geometry.coordinates[1],
        lon : f.geometry.coordinates[0],
        visible: false,
        size: 'medium',
        color: 'gray',
        techIssue: false,
        staffIssue: false
    }))

    store.setAirports(rows)
})

const rows = computed(() => {
    return [...store.airports].sort((a, b) => {
        if (a.visible !== b.visible) {           // visible rows come first
        return a.visible ? -1 : 1
        }
        return b.lat - a.lat                      // Further north comes first
        //return a.icao.localeCompare(b.icao)     // then alphabetical
    })
})
</script>

<template>
  <div class="toolbar-section">
    <SectionHeader>AIRPORTS</SectionHeader>

    <TransitionGroup name="airrow" tag="div" class="airport-list">
      <AirportRow v-for="a in rows" :key="a.icao" :airport="a" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
  .airport-list {
    display:flex;
    flex-direction:column;
    gap:4px;
  }

  /* wrapper already has `display:flex` or `flex-direction:column` */

.airrow-move,          /* triggered when an item changes position */
.airrow-enter-active,
.airrow-leave-active {
  transition: transform 250ms ease, opacity 250ms ease;
}

.airrow-enter-from,
.airrow-leave-to   { opacity: 0; transform: translateY(10px); }

/* optional: keep height while fading out, so rows below don’t jump */
.airrow-leave-active {
  position: absolute;
}

      
</style>
