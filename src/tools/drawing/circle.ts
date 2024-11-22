import { Canvas, Ellipse } from "fabric";

import type { DrawingState, IEvent, Tool } from "~/types/tools";

const drawingState: DrawingState = {
  isDrawing: false,
  startX: 0,
  startY: 0,
  currentObject: null,
};

const circleTool: Tool = {
  name: "circle",
  cursor: "crosshair",

  handleMouseDown: (canvas: Canvas, event: IEvent) => {
    // Get pointer coordinates
    const pointer = canvas.getPointer(event.e as MouseEvent);
    drawingState.isDrawing = true;
    drawingState.startX = pointer.x;
    drawingState.startY = pointer.y;

    // Create new circle (ellipse)
    const circle = new Ellipse({
      left: pointer.x,
      top: pointer.y,
      originX: "left",
      originY: "top",
      rx: 0,
      ry: 0,
      fill: "transparent",
      stroke: "#00a0f5",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    canvas.add(circle);
    drawingState.currentObject = circle;
    canvas.requestRenderAll();
  },

  handleMouseMove: (canvas: Canvas, event: IEvent) => {
    if (!drawingState.isDrawing || !drawingState.currentObject) return;

    const pointer = canvas.getPointer(event.e as MouseEvent);
    const circle = drawingState.currentObject as Ellipse;

    // Calculate radius based on pointer position
    const rx = Math.abs(pointer.x - drawingState.startX) / 2;
    const ry = Math.abs(pointer.y - drawingState.startY) / 2;

    // Update circle position and size
    circle.set({
      left: Math.min(pointer.x, drawingState.startX),
      top: Math.min(pointer.y, drawingState.startY),
      rx: rx,
      ry: ry,
      originX: "left",
      originY: "top",
    });

    canvas.requestRenderAll();
  },

  handleMouseUp: (canvas: Canvas, event: IEvent) => {
    drawingState.isDrawing = false;
    if (drawingState.currentObject) {
      // Make the circle selectable and evented again
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

export default circleTool;
