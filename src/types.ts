import { Vector2 } from 'three'

export interface Pin {
  id: string
  position: Vector2
  uv: Vector2
}

export type Mode = 'exhibition' | 'map' | 'setup'
