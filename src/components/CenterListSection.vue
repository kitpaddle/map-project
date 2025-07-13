<script setup>
import { onMounted, computed } from 'vue'
import { useMapStore } from '../stores/mapStore'
import layerConfig from '../layerConfig.js'
import CenterRow from './CenterRow.vue'
import SectionHeader from './SectionHeader.vue'

const store = useMapStore()

onMounted(async () => {
  if (store.centers.length) return               // already loaded
  const url = import.meta.env.BASE_URL + layerConfig.centers.url
  const geo = await fetch(url).then(r => r.json())
  const list = geo.features.map(f => ({
    icao:      f.properties.icao,
    name:      f.properties.name,
    lat:       f.geometry.coordinates[1],
    lon:       f.geometry.coordinates[0],
    visible:   false,
    size:      'medium',      // optional
    color:     'gray',       // optional
    techIssue: false,
    staffIssue:false
  }))
  store.setCenters(list)
})

/* simple sort: visible first, then north→south */
const rows = computed(() =>
  [...store.centers].sort((a,b) =>
    a.visible!==b.visible ? (a.visible? -1:1) : b.lat - a.lat
  )
)
</script>

<template>
  <div class="toolbar-section">
    <SectionHeader>CENTERS</SectionHeader>

    <TransitionGroup name="airrow" tag="div" class="center-list">
      <CenterRow v-for="c in rows" :key="c.icao" :center="c" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
    .center-list {
        display:flex;
        flex-direction:column;
        gap:4px;
    }
</style>
