import { Canvas } from "fabric";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { Spinner } from "~/components/ui/Spinner";

import { useCanvasContext } from "~/context/CanvasContext";
import { useObject } from "~/context/ObjectContext";
import imageTool from "~/tools/image-tool";
import selectTool from "~/tools/select-tool";
import type { SteamScreenshot } from "~/types/steam";

interface CollageCanvasProps {
  width: number;
  height: number;
  backgroundColor: string;
  screenshots: SteamScreenshot[];
  onError?: (error: string) => void;
}

export interface CollageCanvasRef {
  getDataUrl: () => string;
}

const CollageCanvas = forwardRef<CollageCanvasRef, CollageCanvasProps>(function CollageCanvas(
  { width, height, backgroundColor, screenshots, onError },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setCanvas } = useCanvasContext();
  const { selectObject } = useObject();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    console.log("Initializing canvas...");
    try {
      const canvas = new Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor,
        preserveObjectStacking: true,
        enableRetinaScaling: true,
        selection: true,
        renderOnAddRemove: true,
        fireRightClick: true,
        stopContextMenu: true,
        interactive: true,
        isDrawingMode: false,
        allowTouchScrolling: false, // Prevent touch scrolling while drawing
      });

      // Set up canvas viewport
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.calcOffset();

      // Handle object selection
      canvas.on("selection:created", (e) => {
        if (e.selected && e.selected[0]) {
          selectObject(e.selected[0]);
        }
      });

      canvas.on("selection:updated", (e) => {
        if (e.selected && e.selected[0]) {
          selectObject(e.selected[0]);
        }
      });

      canvas.on("selection:cleared", () => {
        selectObject(null);
      });

      // Handle canvas resize
      const resizeCanvas = () => {
        if (!containerRef.current || !canvas) return;

        const containerWidth = containerRef.current.clientWidth;
        const scale = containerWidth / width;

        canvas.setDimensions({
          width: containerWidth,
          height: height * scale,
        });

        canvas.setZoom(scale);
        canvas.calcOffset(); // Recalculate offset after resize
        canvas.renderAll();
      };

      // Initial resize
      resizeCanvas();

      // Listen for window resize
      window.addEventListener("resize", resizeCanvas);

      // Set up canvas event handlers
      canvas.on("mouse:down", () => {
        canvas.calcOffset(); // Ensure offset is correct when starting to draw
      });

      canvas.on("mouse:move", (e) => {
        if (e.e) {
          e.e.preventDefault(); // Prevent scrolling while drawing
        }
      });

      fabricRef.current = canvas;
      setCanvas(canvas);

      // Set up default tool
      canvas.defaultCursor = selectTool.cursor;
      canvas.hoverCursor = "move";

      console.log("Canvas initialized successfully");

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        if (fabricRef.current) {
          fabricRef.current.dispose();
          fabricRef.current = null;
          setCanvas(null);
        }
      };
    } catch (err) {
      console.error("Failed to initialize canvas:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize canvas");
    }
  }, [width, height, backgroundColor, setCanvas, selectObject]);

  // Load screenshots when they change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !screenshots.length) return;

    const loadImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await imageTool.addImagesToCanvas(
          canvas,
          screenshots.map((s) => s.url)
        );
      } catch (err) {
        console.error("Failed to load images:", err);
        setError(err instanceof Error ? err.message : "Failed to load images");
        onError?.(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [screenshots, onError]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Canvas error:", error);
      onError?.(error);
    }
  }, [error, onError]);

  // Expose canvas methods via ref
  useImperativeHandle(
    ref,
    () => ({
      getDataUrl: () => {
        if (!fabricRef.current) return "";
        const pixelRatio = window.devicePixelRatio || 1;
        return fabricRef.current.toDataURL({
          format: "png",
          quality: 1,
          multiplier: pixelRatio,
          enableRetinaScaling: true,
        });
      },
    }),
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ aspectRatio: `${width}/${height}` }}
    >
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
        tabIndex={1}
      />
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
          <Spinner size="lg" className="mb-4" />
          <div className="text-white text-center">
            <div className="mb-2">Loading images...</div>
            <div className="text-sm opacity-75">Please wait while we prepare your collage</div>
          </div>
        </div>
      )}
    </div>
  );
});

CollageCanvas.displayName = "CollageCanvas";

export default CollageCanvas;
