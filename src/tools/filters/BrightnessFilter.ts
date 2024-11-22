import { filters } from "fabric";

export class BrightnessFilter extends filters.Brightness {
  static type = "Brightness";

  constructor(options: { brightness?: number } = {}) {
    super({
      brightness: options.brightness ?? 0,
    });
  }

  static fromObject(object: any): Promise<BrightnessFilter> {
    return Promise.resolve(new BrightnessFilter(object));
  }
}
