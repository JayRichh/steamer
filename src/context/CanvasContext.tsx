import { Canvas, Object as FabricObject } from "fabric";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import tools from "~/tools/drawing";
import HistoryManager from "~/tools/history";
import type { DrawingTool } from "~/types/tools";
import { convertFabricEvent } from "~/types/tools";

interface CanvasContextType {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  currentTool: DrawingTool;
  setCurrentTool: (tool: DrawingTool) => void;
  addObject: (object: FabricObject) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [currentTool, setCurrentTool] = useState<DrawingTool>("select");
  const [history, setHistory] = useState<HistoryManager | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize history manager when canvas is set
  useEffect(() => {
    if (canvas) {
      const historyManager = new HistoryManager(canvas);
      setHistory(historyManager);

      // Clean up history manager when canvas changes
      return () => {
        historyManager.destroy();
      };
    }
  }, [canvas]);

  // Update tool when it changes
  useEffect(() => {
    if (!canvas) return;

    // Clean up previous tool
    const currentToolObj = tools[currentTool];
    if (currentToolObj) {
      currentToolObj.cleanUp(canvas);
    }

    // Set up new tool
    canvas.defaultCursor = currentToolObj?.cursor || "default";
    canvas.selection = currentTool === "select";
    canvas.forEachObject((obj) => {
      obj.selectable = currentTool === "select";
      obj.evented = currentTool === "select";
    });

    // Remove existing event handlers
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");

    // Set up tool-specific event handlers
    if (currentToolObj) {
      canvas.on("mouse:down", (e) => currentToolObj.handleMouseDown(canvas, convertFabricEvent(e)));
      canvas.on("mouse:move", (e) => currentToolObj.handleMouseMove(canvas, convertFabricEvent(e)));
      canvas.on("mouse:up", (e) => currentToolObj.handleMouseUp(canvas, convertFabricEvent(e)));
    }

    canvas.requestRenderAll();
  }, [canvas, currentTool]);

  // Update undo/redo state
  useEffect(() => {
    if (history) {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    }
  }, [history]);

  const addObject = useCallback(
    (object: FabricObject) => {
      if (canvas) {
        canvas.add(object);
        canvas.setActiveObject(object);
        canvas.requestRenderAll();
      }
    },
    [canvas]
  );

  const undo = useCallback(() => {
    if (history) {
      history.undo();
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    }
  }, [history]);

  const redo = useCallback(() => {
    if (history) {
      history.redo();
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    }
  }, [history]);

  return (
    <CanvasContext.Provider
      value={{
        canvas,
        setCanvas,
        currentTool,
        setCurrentTool,
        addObject,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasContext() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error("useCanvasContext must be used within a CanvasProvider");
  }
  return context;
}
