<template>
    <div class="row"
        :class="{inactive: !a.visible}">

      <span class="icao">{{ a.icao }}</span>
  
      <button class="airport-btn"
              :class="{active:a.visible}"
              @click="store.toggleAirportVisibility(a.icao)">👁</button>
  
      <button class="airport-btn"
              @click="store.cycleAirportSize(a.icao)">
              {{ a.size[0].toUpperCase() }}
      </button>
  
      <button class="airport-btn color-btn"
              @click="store.cycleAirportColor(a.icao)">
              <span class="circle"
              :style="{ background: markerColors[a.color] }"></span>
      </button>
  
      <button class="airport-btn"
              :class="{active:a.techIssue}"
              @click="store.toggleTechIssue(a.icao)">⚙</button>
  
      <button class="airport-btn"
              :class="{active:a.staffIssue}"
              @click="store.toggleStaffIssue(a.icao)">👥</button>
    </div>
</template>
  
<script setup>
  import { useMapStore } from '../stores/mapStore'
  import { markerColors } from '../markerStyleConfig.js'
  const props = defineProps({ airport: Object })
  const a = props.airport
  const store = useMapStore()
</script>
  
<style scoped>
  .row {
    display: grid;
    grid-template-columns: 48px 32px 32px 32px 32px 32px;
    align-items:center;
    gap:4px;
    background-color: rgb(66, 66, 66);
    border-radius: 3px;
  }

  .icao{
    font-family: "Roboto Mono", monospace; /* equal-width letters */
    font-size: 16px;
    font-weight: 600;
    text-align: center;
  }

  .airport-btn {
    font-size: 13px;
    padding: 4px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.5s ease, box-shadow 0.2s ease;
  }

  /* hover glow */
  .airport-btn:hover {
      box-shadow: 0 0 4px #e2e2e2;
  }

  /* active (selected) state */
  .airport-btn.active {
      background: #969696;
  }

  /* ----------- remove glow when a button is toggled off ---------- */
  .airport-btn:not(.active):focus,
  .airport-btn:not(.active):hover,
  .airport-btn:not(.active):focus-visible {
      box-shadow: none;
      outline: none;
  }

  .color-btn {
  padding: 0px;    
  height: 26px;                   
  display: flex;
  justify-content: center;
  align-items: center;
  }

  /* the coloured swatch */
  .color-btn .circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #fff;           /* thin outline for contrast */
  }

  .row.inactive {
    background: #2b2b2b;              /* darker background */
  }

  .row.inactive .icao {
    color: #5c5c5c;                   /* muted text colour */
  }

</style>
  