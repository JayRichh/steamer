import { filters } from "fabric";

export class ContrastFilter extends filters.Contrast {
  static type = "Contrast";

  constructor(options: { contrast?: number } = {}) {
    super({
      contrast: options.contrast ?? 0,
    });
  }

  static fromObject(object: any): Promise<ContrastFilter> {
    return Promise.resolve(new ContrastFilter(object));
  }
}
