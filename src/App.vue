<script setup lang="ts">
import { Vector2 } from 'three'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import Mapper from './components/Mapper.vue'
import { key } from './store'
import { Pin } from './types'
import sampleVideoPath from './assets/sample.webm'

const store = useStore(key)

enum LocalStorageKey {
  PIN_POSITIONS = 'exhibition-mapper_pinPositions',
}

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

const updatePinPosition = (id: Pin['id'], x: number, y: number) => {
  for (const pin of state.pins) {
    if (pin.id === id) {
      pin.position.set(x, y)
    }
  }
}

// Restore pins
onMounted(() => {
  const posString = localStorage.getItem(LocalStorageKey.PIN_POSITIONS)

  if (posString) {
    const positions = JSON.parse(posString) as number[][]
    for (let i = 0; i < Math.min(state.pins.length, positions.length); i++) {
      updatePinPosition(state.pins[i].id, positions[i][0], positions[i][1])
    }
  }
})

watch([state.pins], () => {
  const poss = state.pins.reduce<number[][]>((pos, pin) => {
    pos.push(pin.position.toArray())
    return pos
  }, [])
  localStorage.setItem(LocalStorageKey.PIN_POSITIONS, JSON.stringify(poss))
})

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
const videoURL = ref<string>(sampleVideoPath)
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
    @pin-position-update="updatePinPosition"
  />
  <div class="setup-ui" v-show="store.state.mode === 'setup'">
    <input
      class="file-selector"
      type="file"
      @change="handleFileSelection"
      accept="video/*"
    />
    <video
      class="app-video"
      ref="videoRef"
      controls
      :src="videoURL"
      autoplay
      loop
    ></video>
    <div class="key-shortcut-hint">
      Press keys to switch modes: [e]xhibition / [s]etup / [m]apping
    </div>
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

.app-video {
  max-width: 50vw;
  max-height: 50vh;
  border: 1px solid #888;
}

.setup-ui {
  position: absolute;

  .file-selector {
    display: block;
  }

  .key-shortcut-hint {
    position: fixed;
    bottom: 10px;
  }
}
</style>
