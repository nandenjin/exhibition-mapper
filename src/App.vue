<script setup lang="ts">
import { Vector2 } from 'three'
import { reactive } from 'vue'
import Mapper from './components/Mapper.vue'
import { Pin } from './types'

const state = reactive<{
  pins: Pin[]
}>({
  pins: [
    {
      id: '0',
      position: new Vector2(100, -100),
    },
    {
      id: '1',
      position: new Vector2(-100, -100),
    },
    {
      id: '2',
      position: new Vector2(-100, 100),
    },
    {
      id: '3',
      position: new Vector2(100, 100),
    },
  ],
})

const updatePin = (updated: Pin) => {
  for (const pin of state.pins) {
    if (pin.id === updated.id) {
      pin.position.copy(updated.position)
    }
  }
}
</script>

<template>
  <Mapper
    :width="960"
    :height="600"
    :pins="state.pins"
    @pin-position-update="updatePin"
  />
</template>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  font: normal 12px 'Courier New', monospace;
  color: #fff;
  background-color: #000;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
