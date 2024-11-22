import { Canvas, Object as FabricObject } from "fabric";

import type { IEvent, Tool } from "~/types/tools";

const selectTool: Tool = {
  name: "select",
  cursor: "default",

  handleMouseDown: (canvas: Canvas, event: IEvent) => {
    const target = canvas.findTarget(event.e as MouseEvent) as FabricObject | null;
    if (!target) {
      // Only clear selection if clicking on empty canvas
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    } else {
      // If clicking on an object, ensure it's selected
      canvas.setActiveObject(target);
      canvas.requestRenderAll();
    }
  },

  handleMouseMove: (canvas: Canvas, event: IEvent) => {
    // Update cursor based on what's under it
    const target = canvas.findTarget(event.e as MouseEvent) as FabricObject | null;
    if (target) {
      canvas.defaultCursor = "move";
    } else {
      canvas.defaultCursor = "default";
    }
  },

  handleMouseUp: (canvas: Canvas, event: IEvent) => {
    // No specific action needed on mouse up for selection
  },

  cleanUp: (canvas: Canvas) => {
    canvas.defaultCursor = "default";
    canvas.hoverCursor = "move";
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
  },
};

export default selectTool;
