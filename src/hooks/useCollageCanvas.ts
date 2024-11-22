import {
  Canvas,
  Control,
  type ControlActionHandler,
  FabricImage,
  type TDataUrlOptions,
  util,
} from "fabric";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SteamScreenshot } from "~/types/steam";

interface CollageCanvasOptions {
  width: number;
  height: number;
  backgroundColor: string;
}

interface CanvasState {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  imagesLoaded: boolean;
}

// Delete icon SVG
const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

export function useCollageCanvas(options: CollageCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const deleteImgRef = useRef<HTMLImageElement | null>(null);
  const mountedRef = useRef(true);
  const stateRef = useRef<CanvasState>({
    isReady: false,
    isLoading: false,
    error: null,
    imagesLoaded: false,
  });

  const [state, setState] = useState<CanvasState>(stateRef.current);

  // Safe setState that checks if component is mounted and updates ref
  const safeSetState = useCallback((updater: (prev: CanvasState) => CanvasState) => {
    if (mountedRef.current) {
      stateRef.current = updater(stateRef.current);
      setState(stateRef.current);
    }
  }, []);

  // Initialize delete icon
  useEffect(() => {
    if (typeof window === "undefined") return;

    const img = document.createElement("img");
    img.src = deleteIcon;
    deleteImgRef.current = img;
  }, []);

  // Initialize canvas instance
  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;

    console.log("Initializing canvas...");
    try {
      const pixelRatio = window.devicePixelRatio || 1;
      const canvasEl = canvasRef.current;

      // Initialize fabric canvas
      fabricRef.current = new Canvas(canvasEl, {
        width: options.width,
        height: options.height,
        backgroundColor: options.backgroundColor,
        selection: true,
        preserveObjectStacking: true,
        enableRetinaScaling: true,
        renderOnAddRemove: true,
        fireRightClick: true,
        stopContextMenu: true,
        imageSmoothingEnabled: true,
      });

      const canvas = fabricRef.current;

      // Configure default object properties
      canvas.set({
        selectionColor: "rgba(0, 160, 245, 0.3)",
        selectionBorderColor: "rgba(0, 160, 245, 0.8)",
        selectionLineWidth: 1,
      });

      // Set dimensions considering device pixel ratio
      canvas.setDimensions({
        width: options.width * pixelRatio,
        height: options.height * pixelRatio,
      });
      canvas.setZoom(1 / pixelRatio);

      // Initial render
      canvas.requestRenderAll();

      safeSetState((prev) => ({ ...prev, isReady: true }));
      console.log("Canvas initialized successfully");

      // Cleanup
      return () => {
        console.log("Disposing canvas...");
        canvas.dispose();
        fabricRef.current = null;
      };
    } catch (error) {
      console.error("Canvas initialization error:", error);
      safeSetState((prev) => ({
        ...prev,
        error: "Failed to initialize canvas",
        isReady: false,
      }));
    }
  }, [options.width, options.height, options.backgroundColor, safeSetState]);

  // Delete object handler
  const deleteObject: ControlActionHandler = useCallback((eventData, transform) => {
    const target = transform.target;
    if (!target?.canvas) return false;
    target.canvas.remove(target);
    target.canvas.requestRenderAll();
    return true;
  }, []);

  // Render icon helper
  const renderIcon = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      left: number,
      top: number,
      _styleOverride: any,
      fabricObject: any
    ) => {
      if (!deleteImgRef.current) return;
      const size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(deleteImgRef.current, -size / 2, -size / 2, size, size);
      ctx.restore();
    },
    []
  );

  // Create collage from screenshots
  const createCollage = useCallback(
    async (screenshots: SteamScreenshot[]) => {
      console.log("Creating collage with screenshots:", screenshots);
      if (!fabricRef.current || !screenshots.length) {
        console.log("No canvas or screenshots available");
        return false;
      }

      const canvas = fabricRef.current;

      try {
        safeSetState((prev) => ({ ...prev, isLoading: true, error: null }));
        canvas.clear();

        // Calculate grid layout
        const numImages = screenshots.length;
        const cols = Math.ceil(Math.sqrt(numImages));
        const rows = Math.ceil(numImages / cols);
        const cellWidth = canvas.getWidth() / cols;
        const cellHeight = canvas.getHeight() / rows;

        console.log(`Loading ${screenshots.length} images in ${cols}x${rows} grid`);

        // Load all images
        const loadImagePromises = screenshots.map(async (screenshot, index) => {
          try {
            console.log(`Loading image ${index + 1}/${screenshots.length}: ${screenshot.url}`);

            const fabricImage = await new Promise<FabricImage>((resolve, reject) => {
              FabricImage.fromURL(
                screenshot.url,
                {
                  crossOrigin: "anonymous",
                },
                (fabricImg: FabricImage | null) => {
                  if (!fabricImg) {
                    reject(new Error(`Failed to load image ${index}`));
                    return;
                  }

                  // Configure image properties after loading
                  fabricImg.set({
                    strokeUniform: true,
                    noScaleCache: false,
                    centeredScaling: true,
                    centeredRotation: true,
                  });

                  resolve(fabricImg);
                }
              );
            });

            if (!mountedRef.current) return false;

            // Calculate position
            const row = Math.floor(index / cols);
            const col = index % cols;
            const scale = Math.min(
              (cellWidth * 0.9) / fabricImage.width!,
              (cellHeight * 0.9) / fabricImage.height!
            );

            // Configure image
            fabricImage.set({
              left: col * cellWidth + cellWidth / 2,
              top: row * cellHeight + cellHeight / 2,
              originX: "center",
              originY: "center",
              scaleX: scale,
              scaleY: scale,
              cornerStyle: "circle",
              cornerColor: "#00a0f5",
              borderColor: "#00a0f5",
              padding: 5,
              transparentCorners: false,
            });

            // Add delete control
            fabricImage.controls = {
              ...fabricImage.controls,
              deleteControl: new Control({
                x: 0.5,
                y: -0.5,
                offsetY: -16,
                offsetX: 16,
                cursorStyle: "pointer",
                mouseUpHandler: deleteObject,
                render: renderIcon,
                sizeX: 24,
                sizeY: 24,
                touchSizeX: 24,
                touchSizeY: 24,
              }),
            };

            canvas.add(fabricImage);
            canvas.requestRenderAll();
            console.log(`Image ${index + 1} added to canvas`);
            return true;
          } catch (error) {
            console.error(`Failed to process image ${index}:`, error);
            return false;
          }
        });

        const results = await Promise.all(loadImagePromises);

        if (!mountedRef.current) return false;

        const successCount = results.filter(Boolean).length;
        console.log(`Successfully loaded ${successCount}/${screenshots.length} images`);

        if (successCount === 0) {
          throw new Error("No images were successfully loaded");
        }

        // Center and arrange objects
        canvas.centerObject(canvas.getObjects()[0]);
        canvas.requestRenderAll();

        safeSetState((prev) => ({ ...prev, isLoading: false, imagesLoaded: true }));
        console.log("Collage created successfully");
        return true;
      } catch (error) {
        if (!mountedRef.current) return false;

        console.error("Failed to create collage:", error);
        safeSetState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to create collage",
        }));
        return false;
      }
    },
    [deleteObject, renderIcon, safeSetState]
  );

  // Get canvas data URL
  const getDataUrl = useCallback(() => {
    if (!fabricRef.current) return "";
    const pixelRatio = window.devicePixelRatio || 1;
    const options: TDataUrlOptions = {
      format: "png",
      quality: 1,
      multiplier: pixelRatio,
      enableRetinaScaling: true,
    };
    return fabricRef.current.toDataURL(options);
  }, []);

  // Add keyboard handlers
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricRef.current) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = fabricRef.current.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
          fabricRef.current.discardActiveObject();
          fabricRef.current.requestRenderAll();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    canvasRef,
    createCollage,
    getDataUrl,
    ...state,
  };
}
