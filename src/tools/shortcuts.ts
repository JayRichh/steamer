import { Canvas } from "fabric";

import type { ToolName } from "./drawing";
import manipulationTools from "./manipulation";
import transformTools from "./transform";

type ShortcutHandler = (canvas: Canvas, event?: KeyboardEvent) => void;

interface ShortcutHandlers {
  [key: string]: ShortcutHandler;
}

export const createShortcutHandlers = (
  canvas: Canvas,
  setCurrentTool: (tool: ToolName) => void
): ShortcutHandlers => ({
  // Tool Selection
  v: (_canvas) => setCurrentTool("select"),
  r: (_canvas) => setCurrentTool("rectangle"),
  c: (_canvas) => setCurrentTool("circle"),
  l: (_canvas) => setCurrentTool("line"),
  t: (_canvas) => setCurrentTool("text"),
  b: (_canvas) => setCurrentTool("brush"),

  // Delete
  Delete: (canvas) => manipulationTools.delete(canvas),
  Backspace: (canvas) => manipulationTools.delete(canvas),

  // Copy/Paste/Duplicate
  d: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.duplicate(canvas);
    }
  },

  // Rotation
  "[": (canvas) => transformTools.rotate(canvas, -15),
  "]": (canvas) => transformTools.rotate(canvas, 15),

  // Flip
  h: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.flipHorizontal(canvas);
    }
  },
  j: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.flipVertical(canvas);
    }
  },

  // Grouping
  g: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.group(canvas);
    }
  },
  u: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.ungroup(canvas);
    }
  },

  // Alignment
  ArrowLeft: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.alignLeft(canvas);
    }
  },
  ArrowRight: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.alignRight(canvas);
    }
  },
  ArrowUp: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.alignTop(canvas);
    }
  },
  ArrowDown: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.alignBottom(canvas);
    }
  },

  // Layer Management
  PageUp: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.bringForward(canvas);
    }
  },
  PageDown: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.sendBackward(canvas);
    }
  },
  Home: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.bringToFront(canvas);
    }
  },
  End: (canvas, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      event.preventDefault();
      manipulationTools.sendToBack(canvas);
    }
  },
});

export const setupKeyboardShortcuts = (
  canvas: Canvas,
  setCurrentTool: (tool: ToolName) => void
) => {
  const handlers = createShortcutHandlers(canvas, setCurrentTool);

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const handler = handlers[e.key];
    if (handler) {
      handler(canvas, e);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
};

export const shortcutsList = [
  { key: "V", description: "Select tool" },
  { key: "R", description: "Rectangle tool" },
  { key: "C", description: "Circle tool" },
  { key: "L", description: "Line tool" },
  { key: "T", description: "Text tool" },
  { key: "B", description: "Brush tool" },
  { key: "Delete/Backspace", description: "Delete selected object" },
  { key: "Ctrl/⌘ + D", description: "Duplicate selected object" },
  { key: "[/]", description: "Rotate -/+ 15 degrees" },
  { key: "Ctrl/⌘ + H", description: "Flip horizontal" },
  { key: "Ctrl/⌘ + J", description: "Flip vertical" },
  { key: "Ctrl/⌘ + G", description: "Group selected objects" },
  { key: "Ctrl/⌘ + U", description: "Ungroup selected objects" },
  { key: "Ctrl/⌘ + Arrow keys", description: "Align objects" },
  { key: "Ctrl/⌘ + Page Up/Down", description: "Bring forward/Send backward" },
  { key: "Ctrl/⌘ + Home/End", description: "Bring to front/Send to back" },
];

const shortcuts = {
  setupKeyboardShortcuts,
  shortcutsList,
};

export default shortcuts;
