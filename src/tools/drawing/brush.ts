import { Canvas, Path, util } from "fabric";

import type { IEvent, Tool } from "~/types/tools";

interface BrushState {
  isDrawing: boolean;
  path: Path | null;
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

const brushState: BrushState = {
  isDrawing: false,
  path: null,
  points: [],
  color: "#00a0f5",
  width: 2,
};

const brushTool: Tool = {
  name: "brush",
  cursor: "crosshair",

  setColor(color: string) {
    brushState.color = color;
    if (brushState.path) {
      brushState.path.set({ stroke: color });
    }
  },

  getColor() {
    return brushState.color;
  },

  setWidth(width: number) {
    brushState.width = width;
    if (brushState.path) {
      brushState.path.set({ strokeWidth: width });
    }
  },

  getWidth() {
    return brushState.width;
  },

  handleMouseDown(canvas: Canvas, event: IEvent) {
    const pointer = canvas.getPointer(event.e as MouseEvent);
    brushState.isDrawing = true;
    brushState.points = [{ x: pointer.x, y: pointer.y }];

    // Create path data string
    const pathData = `M ${pointer.x} ${pointer.y} L ${pointer.x} ${pointer.y}`;

    brushState.path = new Path(pathData, {
      stroke: brushState.color,
      strokeWidth: brushState.width,
      fill: "transparent",
      strokeLineCap: "round",
      strokeLineJoin: "round",
      selectable: false,
      evented: false,
      perPixelTargetFind: true,
      objectCaching: false,
    });

    canvas.add(brushState.path);
    canvas.renderAll(); // Immediate render to show starting point
  },

  handleMouseMove(canvas: Canvas, event: IEvent) {
    if (!brushState.isDrawing || !brushState.path) return;

    const pointer = canvas.getPointer(event.e as MouseEvent);
    brushState.points.push({ x: pointer.x, y: pointer.y });

    // Generate SVG path data string
    const pathData = generatePathString(brushState.points);

    // Update the path immediately
    brushState.path.set({
      path: pathData,
      dirty: true,
      objectCaching: false,
    });

    // Force immediate render to show drawing in real-time
    canvas.renderAll();
  },

  handleMouseUp(canvas: Canvas, event: IEvent) {
    if (!brushState.isDrawing || !brushState.path) return;

    brushState.isDrawing = false;

    // Simplify the points while maintaining the full drawing area
    const simplifiedPoints = simplifyPoints(brushState.points);
    const pathData = generatePathString(simplifiedPoints);

    // Update the final path
    brushState.path.set({
      path: pathData,
      selectable: true,
      evented: true,
      objectCaching: true,
    });

    canvas.setActiveObject(brushState.path);
    brushState.path = null;
    brushState.points = [];
    canvas.renderAll();
  },

  cleanUp(canvas: Canvas) {
    brushState.isDrawing = false;
    brushState.path = null;
    brushState.points = [];
    canvas.defaultCursor = "default";
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
  },
};

// Helper function to generate SVG path string from points
function generatePathString(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
  }

  let pathData = `M ${points[0].x} ${points[0].y}`;

  // Add line commands for each subsequent point
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  return pathData;
}

// Helper function to simplify points while maintaining the full drawing area
function simplifyPoints(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  if (points.length <= 2) return points;

  const simplified: Array<{ x: number; y: number }> = [points[0]];
  const threshold = 2; // Reduced threshold for smoother lines

  for (let i = 1; i < points.length - 1; i++) {
    const dx = points[i].x - simplified[simplified.length - 1].x;
    const dy = points[i].y - simplified[simplified.length - 1].y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= threshold) {
      simplified.push(points[i]);
    }
  }

  // Always include the last point
  if (points.length > 1) {
    simplified.push(points[points.length - 1]);
  }

  return simplified;
}

export default brushTool;
