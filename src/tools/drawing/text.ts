import { Canvas, Object as FabricObject, IText } from "fabric";

import type { IEvent, Tool } from "~/types/tools";

const textTool: Tool = {
  name: "text",
  cursor: "text",

  handleMouseDown: (canvas: Canvas, event: IEvent) => {
    // Only add text if clicking on empty canvas
    const target = canvas.findTarget(event.e as MouseEvent) as FabricObject | null;
    if (target) return;

    const pointer = canvas.getPointer(event.e as MouseEvent);
    const text = new IText("Type here...", {
      left: pointer.x,
      top: pointer.y,
      fontSize: 20,
      fill: "#00a0f5",
      fontFamily: "Arial",
      padding: 5,
      selectable: true,
      evented: true,
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.requestRenderAll();
  },

  handleMouseMove: (canvas: Canvas, event: IEvent) => {
    // No specific action needed for text tool mouse move
  },

  handleMouseUp: (canvas: Canvas, event: IEvent) => {
    // No specific action needed for text tool mouse up
  },

  cleanUp: (canvas: Canvas) => {
    // Exit editing mode for any active text object
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text" && (activeObject as IText).isEditing) {
      (activeObject as IText).exitEditing();
    }

    canvas.defaultCursor = "default";
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
  },
};

export default textTool;
