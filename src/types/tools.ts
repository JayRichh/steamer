import { Canvas, Object as FabricObject, filters } from "fabric";

export type DrawingTool = "select" | "rectangle" | "circle" | "line" | "text" | "brush";

// Filter types
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

export type FabricFilter = filters.BaseFilter<string, Record<string, any>>;

// Transform interface matching fabric.js
export interface Transform {
  action: string;
  actionHandler: any;
  altKey: boolean;
  corner: string;
  ex: number;
  ey: number;
  gestureState: any;
  height: number;
  lastX: number;
  lastY: number;
  lockScalingFlip: boolean;
  lockSkewingX: boolean;
  lockSkewingY: boolean;
  offsetX: number;
  offsetY: number;
  original: FabricObject;
  originX: string;
  originY: string;
  scaleX: number;
  scaleY: number;
  shiftKey: boolean;
  skewX: number;
  skewY: number;
  target: FabricObject;
  theta: number;
  width: number;
  x: number;
  y: number;
}

// Event types that work with both mouse and touch events
export interface IEvent {
  e: Event;
  pointer?: { x: number; y: number };
  target?: FabricObject;
  transform?: Transform | null;
  absolutePointer?: { x: number; y: number };
  button?: number;
  isClick?: boolean;
  subTargets?: FabricObject[];
}

export interface Tool {
  name: DrawingTool;
  cursor: string;
  handleMouseDown: (canvas: Canvas, event: IEvent) => void;
  handleMouseMove: (canvas: Canvas, event: IEvent) => void;
  handleMouseUp: (canvas: Canvas, event: IEvent) => void;
  cleanUp: (canvas: Canvas) => void;
  setColor?: (color: string) => void;
  setWidth?: (width: number) => void;
  getColor?: () => string;
  getWidth?: () => number;
}

export interface FeatureTool {
  name: string;
  description: string;
  icon: React.FC;
  action: (object: FabricObject) => void;
  objectType?: string;
  imageOnly?: boolean;
  isCommon?: boolean;
}

export interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentObject: FabricObject | null;
}

export type Tools = {
  [K in DrawingTool]: Tool;
};

// Helper function to get pointer coordinates from event
export function getPointerCoords(canvas: Canvas, event: IEvent): { x: number; y: number } {
  if (event.pointer) {
    return event.pointer;
  }
  return canvas.getPointer(event.e as any);
}

// Helper function to convert fabric event to our event type
export function convertFabricEvent(event: any): IEvent {
  return {
    e: event.e,
    pointer: event.pointer,
    target: event.target,
    transform: event.transform,
    absolutePointer: event.absolutePointer,
    button: event.button,
    isClick: event.isClick,
    subTargets: event.subTargets,
  };
}
