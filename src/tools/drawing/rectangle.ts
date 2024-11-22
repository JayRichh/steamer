import { Canvas, Rect } from "fabric";

import type { DrawingState, IEvent, Tool } from "~/types/tools";

const drawingState: DrawingState = {
  isDrawing: false,
  startX: 0,
  startY: 0,
  currentObject: null,
};

const rectangleTool: Tool = {
  name: "rectangle",
  cursor: "crosshair",

  handleMouseDown: (canvas: Canvas, event: IEvent) => {
    // Get pointer coordinates
    const pointer = canvas.getPointer(event.e as MouseEvent);
    drawingState.isDrawing = true;
    drawingState.startX = pointer.x;
    drawingState.startY = pointer.y;

    // Create new rectangle
    const rect = new Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: "transparent",
      stroke: "#00a0f5",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    canvas.add(rect);
    drawingState.currentObject = rect;
    canvas.requestRenderAll();
  },

  handleMouseMove: (canvas: Canvas, event: IEvent) => {
    if (!drawingState.isDrawing || !drawingState.currentObject) return;

    const pointer = canvas.getPointer(event.e as MouseEvent);
    const rect = drawingState.currentObject as Rect;

    // Calculate width and height based on pointer position
    let width = pointer.x - drawingState.startX;
    let height = pointer.y - drawingState.startY;

    // Handle negative dimensions (drawing from right to left or bottom to top)
    if (width < 0) {
      rect.set("left", pointer.x);
      width = Math.abs(width);
    }
    if (height < 0) {
      rect.set("top", pointer.y);
      height = Math.abs(height);
    }

    rect.set({
      width: width,
      height: height,
    });

    canvas.requestRenderAll();
  },

  handleMouseUp: (canvas: Canvas, _event: IEvent) => {
    drawingState.isDrawing = false;
    if (drawingState.currentObject) {
      // Make the rectangle selectable and evented again
      drawingState.currentObject.set({
        selectable: true,
        evented: true,
      });
      canvas.setActiveObject(drawingState.currentObject);
      drawingState.currentObject = null;
    }
    canvas.requestRenderAll();
  },

  cleanUp: (canvas: Canvas) => {
    drawingState.isDrawing = false;
    drawingState.currentObject = null;
    canvas.defaultCursor = "default";
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
  },
};

export default rectangleTool;
