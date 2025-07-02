<template>
    <div class="toolbar-section">
      <SectionHeader>DRAWING</SectionHeader>
  
      <div class="draw-buttons-row">
        <!-- mode buttons -->
        <button :class="['toolbar-btn', { active: store.activeDrawTool==='draw' }]"
                @click="toggle('draw')">Draw</button>
  
        <button :class="['toolbar-btn', { active: store.activeDrawTool==='edit' }]"
                @click="toggle('edit')">Edit</button>
  
        <button :class="['toolbar-btn', { active: store.activeDrawTool==='delete' }]"
                @click="toggle('delete')">Delete</button>
  
        <!-- colour-cycle button -->
        <button class="toolbar-btn"
                :style="{ backgroundColor: store.drawColor + '60' }"
                @click="store.cycleDrawColor()">
          Color
        </button>
      </div>
    </div>
  </template>
  
<script setup>
  import SectionHeader from './SectionHeader.vue'
  import { useMapStore } from '../stores/mapStore'
  const store = useMapStore()
  
  function toggle(tool) {
    const newTool = tool === store.activeDrawTool ? null : tool
    store.setDrawTool(newTool)
    store.setMarkerTool(null)
  }
</script>
  
<style scoped>
  .draw-buttons-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .draw-buttons-row button {
    flex: 1;
  }
  
</style>
  