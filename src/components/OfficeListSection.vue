<script setup>
import { onMounted, computed } from 'vue'
import { useMapStore } from '../stores/mapStore'
import layerConfig from '../layerConfig.js'
import OfficeRow from './OfficeRow.vue'
import SectionHeader from './SectionHeader.vue'

const store = useMapStore()

onMounted(async () => {
  if (store.offices.length) return               // already loaded
  const url = import.meta.env.BASE_URL + layerConfig.offices.url
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
  store.setOffices(list)
})

/* simple sort: visible first, then north→south */
const rows = computed(() =>
  [...store.offices].sort((a,b) =>
    a.visible!==b.visible ? (a.visible? -1:1) : b.lat - a.lat
  )
)
</script>

<template>
  <div class="toolbar-section">
    <SectionHeader>OFFICES</SectionHeader>

    <TransitionGroup name="airrow" tag="div" class="center-list">
      <OfficeRow v-for="o in rows" :key="o.icao" :office="o" />
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
