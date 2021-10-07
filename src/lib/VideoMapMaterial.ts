import { IUniform, ShaderMaterial, Texture } from 'three'

interface VideoMapMaterialParameters {
  map?: Texture
  blend?: boolean
  videoOpacity?: number
}

export class VideoMapMaterial extends ShaderMaterial {
  constructor(params?: VideoMapMaterialParameters) {
    const blend = params?.blend || false
    /** Actual opacity of video switched by blend option */
    const vOpacity = blend ? params?.videoOpacity || 0.5 : 1

    super({
      uniforms: {
        map: { value: params?.map } as IUniform<Texture>,
        vOpacity: {
          value: vOpacity,
        } as IUniform<number>,
      },
      vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        vec4 pos = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * pos;
      }`,
      fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D map;
      uniform float vOpacity;
      void main() {
        gl_FragColor = vec4((1.0 - vOpacity) * vec3(0.0, 0.7, 1.0) + vOpacity * texture2D(map, vUv).rgb, 1.0);
      }`,
    })

    this.blendValue = blend
    this.vOpacityValue = vOpacity
  }

  get map(): Texture {
    return this.uniforms.map.value
  }

  set map(v: Texture) {
    this.uniforms.map.value = v
  }

  private blendValue

  get blend(): boolean {
    return this.blendValue
  }

  set blend(v: boolean) {
    this.blendValue = v
    this.updateUniforms()
  }

  /** Actual opacity of video switched by blend option */
  private vOpacityValue

  get videoOpacity(): number {
    return this.vOpacityValue
  }

  set videoOpacity(v: number) {
    this.vOpacityValue = v
    this.updateUniforms()
  }

  private updateUniforms() {
    this.uniforms.vOpacity.value = this.blendValue ? this.vOpacityValue : 1
  }
}
