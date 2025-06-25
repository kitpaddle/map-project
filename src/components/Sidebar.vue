<template>
    <div class="sidebar">
      <LayerSection  />
  
      <MarkerSection  />
  
      <DrawSection   :activeShapeColor="activeShapeColor" />
    </div>
</template>
  
<script setup>
    import LayerSection  from './LayerSection.vue'
    import MarkerSection from './MarkerSection.vue'
    import DrawSection   from './DrawSection.vue'    
</script>
  
<style src="../styles/toolbar.css">
    .sidebar{ 
        width:250px;
        background:#1e1e1e;
        color:#fff;
        height:100%;
        overflow-y:auto;
    }
</style>
  