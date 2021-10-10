<script setup lang="ts">
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Vector2,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  VideoTexture,
} from 'three'
import { onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { VideoMapMaterial } from '../lib/VideoMapMaterial'
import { key } from '../store'
import { Pin } from '../types'

const emit = defineEmits<{
  (event: 'pinPositionUpdate', id: Pin['id'], x: number, y: number): void
}>()

const store = useStore(key)

const rootRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const props = defineProps<{
  width: number
  height: number
  pins: Pin[]
  video?: HTMLVideoElement
}>()

let renderer: WebGLRenderer

onMounted(() => {
  renderer = new WebGLRenderer({
    antialias: true,
    canvas: canvasRef.value,
  })
  renderer.setSize(props.width, props.height)

  const renderTick = () => {
    requestAnimationFrame(renderTick)
    renderer.render(scene, camera)
  }

  requestAnimationFrame(renderTick)
})

const scene = new Scene()

const camera = new OrthographicCamera(
  -props.width / 2,
  props.width / 2,
  props.height / 2,
  -props.height / 2,
  0.01,
  1000
)
camera.position.set(0, 0, 100)
camera.updateProjectionMatrix()
camera.lookAt(0, 0, 0)

const geometry = new BufferGeometry()

const position = new BufferAttribute(
  new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  3
)
const uv = new BufferAttribute(
  new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  2
)
geometry.setAttribute('position', position)
geometry.setAttribute('uv', uv)

const mapMaterial = new VideoMapMaterial({ blend: true, videoOpacity: 0.5 })
const mesh = new Mesh(geometry, mapMaterial)
mesh.scale.setY(-1)

scene.add(mesh)

const pinIndexes = new Int8Array([0, 2, 1, 1, 2, 3])
const updateVertices = () => {
  for (let i = 0; i < pinIndexes.length; i++) {
    position.setXYZ(i, ...props.pins[pinIndexes[i]].position.toArray(), 0)
    uv.setXY(i, ...props.pins[pinIndexes[i]].uv.toArray())
  }
  position.needsUpdate = true
}
updateVertices()
watch([props.pins], updateVertices)

const updateVideo = () => {
  const video = props.video
  if (video) {
    const loadVideoToTexture = () => {
      const videoTexture = new VideoTexture(video)
      videoTexture.needsUpdate = true
      mapMaterial.map = videoTexture
      mapMaterial.needsUpdate = true
    }

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.info('Waiting video load')
      video.addEventListener('load', () => {
        console.info('Video loaded')
        loadVideoToTexture()
      })
      video.addEventListener('play', () => {
        console.info('Video played')
        loadVideoToTexture()
      })
    } else {
      console.info('Video is ready')
      loadVideoToTexture()
    }
  }
}
updateVideo()
watch([() => props.video], updateVideo)

watch([() => store.state.mode], () => {
  if (store.state.mode === 'exhibition') {
    mapMaterial.blend = false
  } else {
    mapMaterial.blend = true
  }
})

// Drag UI
let focusingPinId: string | null = null
const dragging = ref<boolean>(false)

const onMouseMove = (e: MouseEvent): void => {
  if (focusingPinId === null || !rootRef.value) return

  const { clientX, clientY } = e
  const bounding = rootRef.value.getBoundingClientRect()
  if (!bounding) return

  const { top, left } = bounding
  const position = new Vector2(
    clientX - left - props.width / 2,
    clientY - top - props.height / 2
  )

  emit('pinPositionUpdate', focusingPinId, ...position.toArray())
}

const onMouseUp = (): void => {
  focusingPinId = null
  dragging.value = false
}

const onMouseDown = (_: MouseEvent, id: string): void => {
  focusingPinId = id
  dragging.value = true
}

// Size
watch([() => props.width, () => props.height], () => {
  camera.left = -props.width / 2
  camera.right = props.width / 2
  camera.top = props.height / 2
  camera.bottom = -props.height / 2
  camera.updateProjectionMatrix()

  if (renderer) {
    renderer.setSize(props.width, props.height)
  }
})
</script>

<template>
  <div class="mapper" ref="rootRef">
    <div>{{ props.width }},{{ props.height }}</div>
    <div class="mapper__renderer-container">
      <canvas ref="canvasRef" class="mapper__renderer"></canvas>
    </div>
    <div
      class="mapper__pin-container"
      ref="containerRef"
      v-if="store.state.mode === 'map'"
      :style="{ width: `${props.width}px`, height: `${props.height}px` }"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
      <div
        class="mapper__pin"
        v-for="pin in props.pins"
        :key="pin.id"
        :style="{
          top: `${pin.position.y + props.height / 2}px`,
          left: `${pin.position.x + props.width / 2}px`,
        }"
        @mousedown="(e) => onMouseDown(e, pin.id)"
      >
        <span v-if="!dragging" class="mapper__pin__label"
          >{{ pin.position.x }},{{ pin.position.y }}</span
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mapper {
  &__renderer-container {
    * {
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  &__pin-container {
    position: absolute;
    top: 0;
    left: 0;
  }

  &__pin {
    $size: 30px;

    position: absolute;
    cursor: pointer;
    user-select: none;

    &::before {
      content: '';
      display: inline-block;
      width: $size;
      height: $size;
      border: 1px solid #fff;
      transform: translate3d(-50%, -50%, 0);
      background-color: rgba(255, 0, 255, 0.5);
      vertical-align: middle;
    }

    &__label {
      display: inline-block;
      transform: translate3d(10px, 0, 0);
      line-height: $size;
      font-weight: bold;
    }
  }
}
</style>
