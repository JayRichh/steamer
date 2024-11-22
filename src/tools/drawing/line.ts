import { Canvas, Line } from "fabric";

import type { DrawingState, IEvent, Tool } from "~/types/tools";

const drawingState: DrawingState = {
  isDrawing: false,
  startX: 0,
  startY: 0,
  currentObject: null,
};

const lineTool: Tool = {
  name: "line",
  cursor: "crosshair",

  handleMouseDown: (canvas: Canvas, event: IEvent) => {
    // Get pointer coordinates
    const pointer = canvas.getPointer(event.e as MouseEvent);
    drawingState.isDrawing = true;
    drawingState.startX = pointer.x;
    drawingState.startY = pointer.y;

    // Create new line
    const line = new Line(
      [drawingState.startX, drawingState.startY, drawingState.startX, drawingState.startY],
      {
        stroke: "#00a0f5",
        strokeWidth: 2,
        selectable: false,
        evented: false,
        originX: "center",
        originY: "center",
      }
    );

    canvas.add(line);
    drawingState.currentObject = line;
    canvas.requestRenderAll();
  },

  handleMouseMove: (canvas: Canvas, event: IEvent) => {
    if (!drawingState.isDrawing || !drawingState.currentObject) return;

    const pointer = canvas.getPointer(event.e as MouseEvent);
    const line = drawingState.currentObject as Line;

    // Update line end point
    line.set({
      x2: pointer.x,
      y2: pointer.y,
    });

    canvas.requestRenderAll();
  },

  handleMouseUp: (canvas: Canvas, event: IEvent) => {
    drawingState.isDrawing = false;
    if (drawingState.currentObject) {
      // Make the line selectable and evented again
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

export default lineTool;
