import { Canvas, Object as FabricObject } from "fabric";

export const transformTools = {
  /**
   * Rotates an object by a specified angle
   */
  rotate: (canvas: Canvas, angle: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("angle", activeObject.angle! + angle);
      canvas.requestRenderAll();
    }
  },

  /**
   * Sets the absolute rotation of an object
   */
  setRotation: (canvas: Canvas, angle: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("angle", angle);
      canvas.requestRenderAll();
    }
  },

  /**
   * Scales an object by a factor
   */
  scale: (canvas: Canvas, scaleFactor: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const currentScaleX = activeObject.scaleX || 1;
      const currentScaleY = activeObject.scaleY || 1;
      activeObject.set({
        scaleX: currentScaleX * scaleFactor,
        scaleY: currentScaleY * scaleFactor,
      });
      canvas.requestRenderAll();
    }
  },

  /**
   * Sets the absolute scale of an object
   */
  setScale: (canvas: Canvas, scaleX: number, scaleY: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        scaleX: scaleX,
        scaleY: scaleY,
      });
      canvas.requestRenderAll();
    }
  },

  /**
   * Moves an object by a relative amount
   */
  move: (canvas: Canvas, deltaX: number, deltaY: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        left: (activeObject.left || 0) + deltaX,
        top: (activeObject.top || 0) + deltaY,
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  },

  /**
   * Sets the absolute position of an object
   */
  setPosition: (canvas: Canvas, left: number, top: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        left: left,
        top: top,
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  },

  /**
   * Resizes an object to specific dimensions
   */
  resize: (canvas: Canvas, width: number, height: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const currentWidth = activeObject.getScaledWidth();
      const currentHeight = activeObject.getScaledHeight();

      if (currentWidth && currentHeight) {
        const scaleX = width / currentWidth;
        const scaleY = height / currentHeight;

        activeObject.set({
          scaleX: activeObject.scaleX! * scaleX,
          scaleY: activeObject.scaleY! * scaleY,
        });
        canvas.requestRenderAll();
      }
    }
  },

  /**
   * Sets the opacity of an object
   */
  setOpacity: (canvas: Canvas, opacity: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("opacity", opacity);
      canvas.requestRenderAll();
    }
  },

  /**
   * Sets the stroke width of an object
   */
  setStrokeWidth: (canvas: Canvas, width: number) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("strokeWidth", width);
      canvas.requestRenderAll();
    }
  },

  /**
   * Sets the stroke color of an object
   */
  setStrokeColor: (canvas: Canvas, color: string) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("stroke", color);
      canvas.requestRenderAll();
    }
  },

  /**
   * Sets the fill color of an object
   */
  setFillColor: (canvas: Canvas, color: string) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("fill", color);
      canvas.requestRenderAll();
    }
  },

  /**
   * Sets whether an object casts a shadow
   */
  setShadow: (
    canvas: Canvas,
    options: { color?: string; blur?: number; offsetX?: number; offsetY?: number }
  ) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("shadow", options);
      canvas.requestRenderAll();
    }
  },

  /**
   * Resets the transform of an object
   */
  resetTransform: (canvas: Canvas) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        skewX: 0,
        skewY: 0,
      });
      canvas.requestRenderAll();
    }
  },
};

export default transformTools;
