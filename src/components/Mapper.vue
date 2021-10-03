<script setup lang="ts">
import { WebGLRenderer, Scene, OrthographicCamera, Vector2 } from 'three'
import { onMounted, ref } from 'vue'
import { Pin } from '../types'

const rootRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const props = defineProps<{
  width: number
  height: number
  pins: Pin[]
}>()

onMounted(() => {
  const renderer = new WebGLRenderer({
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
  1,
  1000
)
camera.updateProjectionMatrix()

let focusingPinId: string | null = null

const emit = defineEmits<{
  (event: 'pinPositionUpdate', pin: Pin): void
}>()

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
}

const onMouseDown = (_: MouseEvent, id: string): void => {
  focusingPinId = id
}
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
        {{ pin.position.x }},{{ pin.position.y }}
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
  }
}
</style>
