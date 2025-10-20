<!-- src/components/OfficeRow.vue -->
<template>
  <div class="row" :class="{ inactive: !o.visible }">
    <span class="icao" :data-tip="o.name">{{ o.icao }}</span>

    <button class="airport-btn"
            :class="{active:o.visible}"
            @click="store.toggleOfficeVisibility(o.icao)">👁</button>

    <button class="airport-btn"
            @click="store.cycleOfficeSize(o.icao)">
      {{ o.size[0].toUpperCase() }}
    </button>

    <button class="airport-btn color-btn"
            @click="store.cycleOfficeColor(o.icao)">
      <span class="circle" :style="{ background: markerColors[o.color] }"></span>
    </button>

    <button class="airport-btn"
            :class="{active:o.techIssue}"
            @click="store.toggleOfficeTechIssue(o.icao)">⚙</button>

    <button class="airport-btn"
            :class="{active:o.staffIssue}"
            @click="store.toggleOfficeStaffIssue(o.icao)">👥</button>
  </div>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore'
import { markerColors } from '../markerStyleConfig.js'
const props = defineProps({ office: Object })
const o = props.office
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
  font-family: "Roboto Mono", monospace;
  font-size: 16px;
  font-weight: 600;
  text-align: center;

  cursor: default;
  user-select: none;
  position: relative; /* anchor for ::after tooltip */
}

/* the tooltip bubble */
.icao::after {
  content: attr(data-tip);
  position: absolute;
  left: 70px;
  bottom: 20px;
  transform: translateX(-50%);
  white-space: nowrap;
  background: rgba(0,0,0,.90);
  border: 1px solid #fff;
  color: #fff;
  font-size: 12px;
  padding: 2px 4px;
  opacity: 0;                /* hidden by default */
  pointer-events: none;
  transition: opacity 100ms ease;
  z-index: 2500;
}

/* show on hover/focus */
.icao:hover::after,
.icao:focus-visible::after { opacity: 1; }

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

.airport-btn:hover { box-shadow: 0 0 4px #e2e2e2; }
.airport-btn.active { background: #969696; }

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

.color-btn .circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #fff;
}

.row.inactive { background: #2b2b2b; }
.row.inactive .icao { color: #5c5c5c; }
</style>
