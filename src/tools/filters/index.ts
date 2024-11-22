import { BrightnessFilter } from "./BrightnessFilter";
import { ColorFilter } from "./ColorFilter";
import { ContrastFilter } from "./ContrastFilter";

export { ColorFilter, BrightnessFilter, ContrastFilter };

export type FilterType = "Color" | "Brightness" | "Contrast";

export interface FilterOptions {
  type: FilterType;
  options: {
    color?: string;
    opacity?: number;
    brightness?: number;
    contrast?: number;
  };
}

export function createFilter(options: FilterOptions) {
  switch (options.type) {
    case "Color":
      return new ColorFilter({
        color: options.options.color,
        opacity: options.options.opacity,
      });
    case "Brightness":
      return new BrightnessFilter({
        brightness: options.options.brightness,
      });
    case "Contrast":
      return new ContrastFilter({
        contrast: options.options.contrast,
      });
    default:
      throw new Error(`Unknown filter type: ${options.type}`);
  }
}

export const filters = {
  Color: ColorFilter,
  Brightness: BrightnessFilter,
  Contrast: ContrastFilter,
} as const;
