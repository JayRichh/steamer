import { Image as FabricImage } from "fabric";
import {
  ArrowBigDown,
  ArrowBigUp,
  Circle as CircleIcon,
  Copy,
  FlipHorizontal,
  FlipVertical,
  Group,
  // Lock,
  Minus,
  MousePointer2,
  MoveHorizontal,
  MoveVertical,
  Pen,
  // RotateCw,
  Sliders,
  Square,
  Trash2,
  Type,
  Ungroup,
  // Unlock,
} from "lucide-react";

import React from "react";

import { Button } from "~/components/ui/Button";
import { FilterControls } from "~/components/ui/FilterControls";

import { cn } from "~/utils/cn";

import { useCanvasContext } from "~/context/CanvasContext";
import tools from "~/tools/drawing";
import manipulationTools from "~/tools/manipulation";
import type { DrawingTool } from "~/types/tools";

interface ToolbarProps {
  className?: string;
}

interface Tool {
  id: DrawingTool;
  icon: React.ElementType;
  label: string;
}

const drawingTools: Tool[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: CircleIcon, label: "Circle" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "text", icon: Type, label: "Text" },
  { id: "brush", icon: Pen, label: "Brush" },
];

export function DrawingToolbar({ className }: ToolbarProps) {
  const { canvas, currentTool, setCurrentTool } = useCanvasContext();
  const [showFilters, setShowFilters] = React.useState(false);
  const [brushColor, setBrushColor] = React.useState("#00a0f5");
  const [brushWidth, setBrushWidth] = React.useState(2);

  const handleManipulation = (action: keyof typeof manipulationTools) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      manipulationTools[action](canvas, activeObject);
    }
  };

  const handleFilterChange = (filter: any) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject instanceof FabricImage) {
      activeObject.filters = [filter];
      activeObject.applyFilters();
      canvas.requestRenderAll();
    }
  };

  const handleBrushColorChange = (color: string) => {
    setBrushColor(color);
    const brushTool = tools.brush;
    if (brushTool.setColor) {
      brushTool.setColor(color);
    }
  };

  const handleBrushWidthChange = (width: number) => {
    setBrushWidth(width);
    const brushTool = tools.brush;
    if (brushTool.setWidth) {
      brushTool.setWidth(width);
    }
  };

  const isImageSelected = () => {
    if (!canvas) return false;
    const activeObject = canvas.getActiveObject();
    return activeObject instanceof FabricImage;
  };

  return (
    <div className={cn("flex flex-col gap-2", className || "")}>
      {/* Drawing Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 space-y-2">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
          Drawing Tools
        </div>
        <div className="grid grid-cols-2 gap-1">
          {drawingTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant={currentTool === tool.id ? "default" : "outline"}
                size="sm"
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => setCurrentTool(tool.id)}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tool.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Brush Controls */}
        {currentTool === "brush" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Brush Color
              </label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => handleBrushColorChange(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Brush Width
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushWidth}
                onChange={(e) => handleBrushWidthChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {brushWidth}px
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manipulation Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 space-y-2">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
          Object Tools
        </div>
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("duplicate")}
            className="w-full flex items-center gap-2 justify-start"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm">Duplicate</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("delete")}
            className="w-full flex items-center gap-2 justify-start"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("flipHorizontal")}
            className="w-full flex items-center gap-2 justify-start"
            title="Flip Horizontal"
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="text-sm">Flip H</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("flipVertical")}
            className="w-full flex items-center gap-2 justify-start"
            title="Flip Vertical"
          >
            <FlipVertical className="w-4 h-4" />
            <span className="text-sm">Flip V</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("group")}
            className="w-full flex items-center gap-2 justify-start"
            title="Group"
          >
            <Group className="w-4 h-4" />
            <span className="text-sm">Group</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("ungroup")}
            className="w-full flex items-center gap-2 justify-start"
            title="Ungroup"
          >
            <Ungroup className="w-4 h-4" />
            <span className="text-sm">Ungroup</span>
          </Button>
        </div>
      </div>

      {/* Alignment Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 space-y-2">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">Alignment</div>
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("centerHorizontally")}
            className="w-full flex items-center gap-2 justify-start"
            title="Center Horizontally"
          >
            <MoveHorizontal className="w-4 h-4" />
            <span className="text-sm">Center H</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("centerVertically")}
            className="w-full flex items-center gap-2 justify-start"
            title="Center Vertically"
          >
            <MoveVertical className="w-4 h-4" />
            <span className="text-sm">Center V</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("bringToFront")}
            className="w-full flex items-center gap-2 justify-start"
            title="Bring to Front"
          >
            <ArrowBigUp className="w-4 h-4" />
            <span className="text-sm">Front</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManipulation("sendToBack")}
            className="w-full flex items-center gap-2 justify-start"
            title="Send to Back"
          >
            <ArrowBigDown className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {isImageSelected() && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Image Filters
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle Filters"
            >
              <Sliders className="w-4 h-4" />
            </Button>
          </div>
          {showFilters && <FilterControls onFilterChange={handleFilterChange} />}
        </div>
      )}
    </div>
  );
}
