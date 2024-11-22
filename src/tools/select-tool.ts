import { Canvas, TEvent } from "fabric";

const selectTool = {
  name: "select",
  cursor: "default",

  handleMouseDown: (canvas: Canvas, event: TEvent) => {
    const target = canvas.findTarget(event.e);
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

  handleMouseMove: (canvas: Canvas, event: TEvent) => {
    // Update cursor based on what's under it
    const target = canvas.findTarget(event.e);
    if (target) {
      canvas.defaultCursor = "move";
    } else {
      canvas.defaultCursor = "default";
    }
  },

  handleMouseUp: () => {
    // No specific action needed on mouse up for selection
  },

  cleanUp: () => {
    // No cleanup needed for selection
  },
};

export default selectTool;
