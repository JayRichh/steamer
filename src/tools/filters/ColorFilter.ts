import { filters } from "fabric";

export class ColorFilter extends filters.BlendColor {
  static type = "Color";

  constructor(options: { color?: string; opacity?: number } = {}) {
    super({
      color: options.color || "#000000",
      mode: "tint",
      alpha: options.opacity ?? 0.5,
    });
  }

  static fromObject(object: any): Promise<ColorFilter> {
    return Promise.resolve(new ColorFilter(object));
  }
}
