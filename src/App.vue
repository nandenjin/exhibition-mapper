<script setup lang="ts">
import { Vector2 } from 'three'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import Mapper from './components/Mapper.vue'
import { key } from './store'
import { Pin } from './types'

const store = useStore(key)

const state = reactive<{
  pins: Pin[]
  width: number
  height: number
}>({
  pins: [
    {
      id: 'TL',
      position: new Vector2(-100, -100),
      uv: new Vector2(0, 1),
    },
    {
      id: 'TR',
      position: new Vector2(-100, 100),
      uv: new Vector2(0, 0),
    },
    {
      id: 'BL',
      position: new Vector2(100, -100),
      uv: new Vector2(1, 1),
    },
    {
      id: 'BR',
      position: new Vector2(100, 100),
      uv: new Vector2(1, 0),
    },
  ],
  width: 0,
  height: 0,
})

const updatePin = (updated: { id: Pin['id']; position: Pin['position'] }) => {
  for (const pin of state.pins) {
    if (pin.id === updated.id) {
      pin.position.copy(updated.position)
    }
  }
}

// Resize
const updateSize = () => {
  state.width = window.innerWidth
  state.height = window.innerHeight
}

updateSize()

onMounted(() => {
  window.addEventListener('resize', updateSize)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

// Setup Mode
const handleModeTrigger = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'e': {
      store.commit('setMode', 'exhibition')
      break
    }
    case 'm': {
      store.commit('setMode', 'map')
      break
    }
    case 's': {
      store.commit('setMode', 'setup')
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleModeTrigger)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleModeTrigger)
})

// File Selection
const videoURL = ref<string>()
const videoRef = ref<HTMLVideoElement>()

const handleFileSelection = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    videoURL.value = URL.createObjectURL(file)
  }
}
</script>

<template>
  <Mapper
    :width="state.width"
    :height="state.height"
    :pins="state.pins"
    :video="videoRef"
    @pin-position-update="updatePin"
  />
  <div class="ui" v-show="store.state.mode === 'setup'">
    <video
      class="video"
      ref="videoRef"
      controls
      :src="videoURL"
      autoplay
      loop
    ></video>
    <input type="file" @change="handleFileSelection" accept="video/*" />
  </div>
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

.ui {
  position: absolute;
}
</style>
