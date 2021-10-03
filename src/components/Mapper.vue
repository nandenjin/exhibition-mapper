<script setup lang="ts">
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Vector2,
  BoxBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  BufferGeometry,
  BufferAttribute,
} from 'three'
import { onMounted, ref, watch } from 'vue'
import { Pin } from '../types'

const emit = defineEmits<{
  (event: 'pinPositionUpdate', pin: Pin): void
}>()

const rootRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const props = defineProps<{
  width: number
  height: number
  pins: Pin[]
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
geometry.setAttribute('position', position)

const material = new MeshBasicMaterial({ color: 0x00bbff })
const mesh = new Mesh(geometry, material)
mesh.scale.setY(-1)

scene.add(mesh)

const positionIndexes = new Int8Array([0, 2, 1, 1, 2, 3])
const updateVertices = () => {
  for (let i = 0; i < positionIndexes.length; i++) {
    position.setXYZ(i, ...props.pins[positionIndexes[i]].position.toArray(), 0)
  }
  position.needsUpdate = true
}
updateVertices()
watch([props.pins], updateVertices)

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

  emit('pinPositionUpdate', { id: focusingPinId, position })
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
    position: absolute;
    cursor: pointer;
    user-select: none;

    &::before {
      content: '';
      display: inline-block;
      width: 15px;
      height: 15px;
      border: 1px solid #fff;
      transform: translate3d(-50%, -50%, 0);
      background-color: rgba(255, 0, 255, 0.5);
    }

    &__label {
      transform: translate3d(10px, 10px, 0);
    }
  }
}
</style>
