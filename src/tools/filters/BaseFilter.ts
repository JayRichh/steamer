import { BaseFilter as FabricBaseFilter, Image, TWebGLPipelineState } from "fabric";

export interface T2DPipelineState {
  imageData: ImageData;
  originalImageData?: ImageData;
  originalEl?: HTMLImageElement;
  sourceWidth?: number;
  sourceHeight?: number;
}

export interface TWebGLUniformLocationMap {
  [key: string]: WebGLUniformLocation;
}

export abstract class BaseFilter extends FabricBaseFilter {
  static type = "BaseFilter";

  constructor(options?: any) {
    super(options);
    if (options) {
      this.setOptions(options);
    }
  }

  setOptions(options: any) {
    for (const prop in options) {
      if (prop in this) {
        (this as any)[prop] = options[prop];
      }
    }
  }

  getFragmentSource(): string {
    return `
      precision highp float;
      uniform sampler2D uTexture;
      varying vec2 vTexCoord;
      void main() {
        gl_FragColor = texture2D(uTexture, vTexCoord);
      }
    `;
  }

  applyTo2d(options: T2DPipelineState): void {
    // Default implementation - no transformation
    return;
  }

  applyTo(options: TWebGLPipelineState): void {
    // Default WebGL implementation
    const gl = options.context;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, options.sourceTexture);
    this.createProgram(options.context, this.getFragmentSource());
    this.sendAttributeData(options.context, options.programCache);
  }

  createProgram(gl: WebGLRenderingContext, fragmentSource: string): WebGLProgram | null {
    // Default program creation
    return null;
  }

  getAttributeLocations(gl: WebGLRenderingContext, program: WebGLProgram): Record<string, number> {
    return {};
  }

  sendAttributeData(gl: WebGLRenderingContext, locations: Record<string, number>): void {
    // Default attribute data sending
  }

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap): void {
    // Default uniform data sending
  }

  getCacheKey(): string {
    return this.type;
  }

  static async fromObject(object: any): Promise<BaseFilter> {
    return new (this as any)(object);
  }

  applyToObject(object: Image) {
    if (!object.filters) {
      object.filters = [];
    }
    object.filters.push(this);
    if (typeof object.applyFilters === "function") {
      object.applyFilters();
    }
  }

  protected get type(): string {
    return (this.constructor as typeof BaseFilter).type;
  }
}
