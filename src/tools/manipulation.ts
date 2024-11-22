import { ActiveSelection, Canvas, Object as FabricObject } from "fabric";

export const manipulationTools = {
  /**
   * Brings the selected object forward one level
   */
  bringForward: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(activeObject);
      if (currentIndex < objects.length - 1) {
        objects.splice(currentIndex, 1);
        objects.splice(currentIndex + 1, 0, activeObject);
        canvas.requestRenderAll();
      }
    }
  },

  /**
   * Brings the selected object to the front
   */
  bringToFront: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(activeObject);
      objects.splice(currentIndex, 1);
      objects.push(activeObject);
      canvas.requestRenderAll();
    }
  },

  /**
   * Sends the selected object backward one level
   */
  sendBackward: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(activeObject);
      if (currentIndex > 0) {
        objects.splice(currentIndex, 1);
        objects.splice(currentIndex - 1, 0, activeObject);
        canvas.requestRenderAll();
      }
    }
  },

  /**
   * Sends the selected object to the back
   */
  sendToBack: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(activeObject);
      objects.splice(currentIndex, 1);
      objects.unshift(activeObject);
      canvas.requestRenderAll();
    }
  },

  /**
   * Duplicates the selected object
   */
  duplicate: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (!activeObject) return;

    // Clone the object
    if (activeObject instanceof ActiveSelection) {
      // For multiple selected objects
      activeObject.getObjects().forEach((obj) => {
        const clonedObj = new (obj.constructor as any)(obj.toObject());
        clonedObj.set({
          left: (obj.left || 0) + 10,
          top: (obj.top || 0) + 10,
          evented: true,
        });
        canvas.add(clonedObj);
      });
    } else {
      const clonedObj = new (activeObject.constructor as any)(activeObject.toObject());
      clonedObj.set({
        left: (activeObject.left || 0) + 10,
        top: (activeObject.top || 0) + 10,
        evented: true,
      });
      canvas.add(clonedObj);
      canvas.setActiveObject(clonedObj);
    }

    canvas.requestRenderAll();
  },

  /**
   * Deletes the selected object
   */
  delete: (canvas: Canvas, object?: FabricObject) => {
    if (object) {
      canvas.remove(object);
    } else {
      const activeObjects = canvas.getActiveObjects();
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
    }
    canvas.requestRenderAll();
  },

  /**
   * Flips the selected object horizontally
   */
  flipHorizontal: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("flipX", !activeObject.flipX);
      canvas.requestRenderAll();
    }
  },

  /**
   * Flips the selected object vertically
   */
  flipVertical: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      activeObject.set("flipY", !activeObject.flipY);
      canvas.requestRenderAll();
    }
  },

  /**
   * Locks the selected object
   */
  lock: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        selectable: false,
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  },

  /**
   * Unlocks the selected object
   */
  unlock: (canvas: Canvas, object: FabricObject) => {
    object.set({
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      hasControls: true,
      selectable: true,
    });
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
  },

  /**
   * Groups the selected objects
   */
  group: (canvas: Canvas, object?: FabricObject) => {
    const activeSelection = object || canvas.getActiveObject();
    if (!(activeSelection instanceof ActiveSelection)) return;

    const group = new ActiveSelection(activeSelection.getObjects(), {
      canvas: canvas,
    });
    canvas.remove(activeSelection);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
    return group;
  },

  /**
   * Ungroups the selected group
   */
  ungroup: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof ActiveSelection)) return;

    const items = activeObject.getObjects();
    canvas.remove(activeObject);

    items.forEach((obj) => {
      canvas.add(obj);
      obj.setCoords();
    });

    canvas.requestRenderAll();
  },

  /**
   * Centers the selected object horizontally
   */
  centerHorizontally: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      const center = canvas.getCenter();
      activeObject.set("left", center.left);
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  },

  /**
   * Centers the selected object vertically
   */
  centerVertically: (canvas: Canvas, object?: FabricObject) => {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
      const center = canvas.getCenter();
      activeObject.set("top", center.top);
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  },

  /**
   * Aligns selected objects to the left
   */
  alignLeft: (canvas: Canvas, object?: FabricObject) => {
    const activeSelection = object || canvas.getActiveObject();
    if (!(activeSelection instanceof ActiveSelection)) return;

    const objects = activeSelection.getObjects();
    const left = objects.reduce((min, obj) => Math.min(min, obj.left!), Infinity);

    objects.forEach((obj) => {
      obj.set("left", left);
      obj.setCoords();
    });

    canvas.requestRenderAll();
  },

  /**
   * Aligns selected objects to the right
   */
  alignRight: (canvas: Canvas, object?: FabricObject) => {
    const activeSelection = object || canvas.getActiveObject();
    if (!(activeSelection instanceof ActiveSelection)) return;

    const objects = activeSelection.getObjects();
    const right = objects.reduce(
      (max, obj) => Math.max(max, obj.left! + obj.width! * obj.scaleX!),
      -Infinity
    );

    objects.forEach((obj) => {
      obj.set("left", right - obj.width! * obj.scaleX!);
      obj.setCoords();
    });

    canvas.requestRenderAll();
  },

  /**
   * Aligns selected objects to the top
   */
  alignTop: (canvas: Canvas, object?: FabricObject) => {
    const activeSelection = object || canvas.getActiveObject();
    if (!(activeSelection instanceof ActiveSelection)) return;

    const objects = activeSelection.getObjects();
    const top = objects.reduce((min, obj) => Math.min(min, obj.top!), Infinity);

    objects.forEach((obj) => {
      obj.set("top", top);
      obj.setCoords();
    });

    canvas.requestRenderAll();
  },

  /**
   * Aligns selected objects to the bottom
   */
  alignBottom: (canvas: Canvas, object?: FabricObject) => {
    const activeSelection = object || canvas.getActiveObject();
    if (!(activeSelection instanceof ActiveSelection)) return;

    const objects = activeSelection.getObjects();
    const bottom = objects.reduce(
      (max, obj) => Math.max(max, obj.top! + obj.height! * obj.scaleY!),
      -Infinity
    );

    objects.forEach((obj) => {
      obj.set("top", bottom - obj.height! * obj.scaleY!);
      obj.setCoords();
    });

    canvas.requestRenderAll();
  },
};

export default manipulationTools;
