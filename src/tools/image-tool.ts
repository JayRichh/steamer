import { Canvas, Image as FabricImage, filters } from "fabric";

type FabricFilter = filters.BaseFilter<string, Record<string, any>>;

const imageTool = {
  name: "image",
  cursor: "default",

  /**
   * Adds an image to the canvas.
   * @param canvas - The Fabric.js canvas instance.
   * @param imageUrl - The URL of the image to add.
   */
  addImageToCanvas: async (canvas: Canvas, imageUrl: string): Promise<FabricImage> => {
    try {
      // Create a promise to load the image
      const imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Enable CORS
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = imageUrl;
      });

      // Calculate dimensions to fit within canvas while maintaining aspect ratio
      const canvasWidth = canvas.width || 800;
      const canvasHeight = canvas.height || 600;
      const imgAspectRatio = imgElement.width / imgElement.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;

      let finalWidth = canvasWidth * 0.8; // 80% of canvas width
      let finalHeight = finalWidth / imgAspectRatio;

      // If height is too large, scale based on height instead
      if (finalHeight > canvasHeight * 0.8) {
        finalHeight = canvasHeight * 0.8;
        finalWidth = finalHeight * imgAspectRatio;
      }

      // Create fabric image instance
      const fabricImage = new FabricImage(imgElement, {
        scaleX: finalWidth / imgElement.width,
        scaleY: finalHeight / imgElement.height,
        left: (canvasWidth - finalWidth) / 2,
        top: (canvasHeight - finalHeight) / 2,
        cornerStyle: "circle",
        cornerColor: "#00a0f5",
        borderColor: "#00a0f5",
        cornerSize: 12,
        padding: 5,
        transparentCorners: false,
        rotatingPointOffset: 40,
      });

      // Add image to canvas
      canvas.add(fabricImage);
      canvas.setActiveObject(fabricImage);
      canvas.requestRenderAll();

      // Center viewport on the image
      canvas.centerObject(fabricImage);

      return fabricImage;
    } catch (error) {
      console.error("Error loading image:", error);
      throw error;
    }
  },

  /**
   * Adds multiple images to the canvas in a grid layout.
   * @param canvas - The Fabric.js canvas instance.
   * @param imageUrls - Array of image URLs to add.
   */
  addImagesToCanvas: async (canvas: Canvas, imageUrls: string[]): Promise<void> => {
    try {
      // Calculate grid dimensions
      const numImages = imageUrls.length;
      const cols = Math.ceil(Math.sqrt(numImages));
      const rows = Math.ceil(numImages / cols);

      // Calculate cell size
      const canvasWidth = canvas.width || 800;
      const canvasHeight = canvas.height || 600;
      const cellWidth = canvasWidth / cols;
      const cellHeight = canvasHeight / rows;

      // Load and add each image
      const promises = imageUrls.map(async (url, index) => {
        try {
          // Create a promise to load the image
          const imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = url;
          });

          // Calculate position in grid
          const row = Math.floor(index / cols);
          const col = index % cols;

          // Calculate scale to fit in cell while maintaining aspect ratio
          const scale = Math.min(
            (cellWidth * 0.9) / imgElement.width,
            (cellHeight * 0.9) / imgElement.height
          );

          // Create fabric image instance
          const fabricImage = new FabricImage(imgElement, {
            scaleX: scale,
            scaleY: scale,
            left: col * cellWidth + cellWidth / 2,
            top: row * cellHeight + cellHeight / 2,
            originX: "center",
            originY: "center",
            cornerStyle: "circle",
            cornerColor: "#00a0f5",
            borderColor: "#00a0f5",
            cornerSize: 12,
            padding: 5,
            transparentCorners: false,
            rotatingPointOffset: 40,
          });

          // Add image to canvas
          canvas.add(fabricImage);
          return fabricImage;
        } catch (error) {
          console.error(`Error loading image ${index}:`, error);
          return null;
        }
      });

      // Wait for all images to load
      const images = await Promise.all(promises);
      const validImages = images.filter((img): img is FabricImage => img !== null);

      if (validImages.length > 0) {
        // Select the first image
        canvas.setActiveObject(validImages[0]);
      }

      canvas.requestRenderAll();
    } catch (error) {
      console.error("Error loading images:", error);
      throw error;
    }
  },

  // Image manipulation methods
  applyFilter: (canvas: Canvas, image: FabricImage, filter: FabricFilter) => {
    if (image) {
      // Save current filters if they exist
      const currentFilters = image.filters || [];

      // Find if a filter of the same type already exists
      const filterType = filter.type;
      const existingFilterIndex = currentFilters.findIndex((f) => f.type === filterType);

      if (existingFilterIndex !== -1) {
        // Replace existing filter
        currentFilters[existingFilterIndex] = filter;
      } else {
        // Add new filter
        currentFilters.push(filter);
      }

      image.filters = currentFilters;
      image.applyFilters();
      canvas.requestRenderAll();
    }
  },

  removeFilters: (canvas: Canvas, image: FabricImage) => {
    if (image) {
      image.filters = [];
      image.applyFilters();
      canvas.requestRenderAll();
    }
  },

  flipHorizontally: (canvas: Canvas, image: FabricImage) => {
    if (image) {
      image.set("flipX", !image.flipX);
      canvas.requestRenderAll();
    }
  },

  flipVertically: (canvas: Canvas, image: FabricImage) => {
    if (image) {
      image.set("flipY", !image.flipY);
      canvas.requestRenderAll();
    }
  },

  // Required tool interface methods
  handleMouseDown: () => {
    // Image tool doesn't need mouse handling
  },

  handleMouseMove: () => {
    // Image tool doesn't need mouse handling
  },

  handleMouseUp: () => {
    // Image tool doesn't need mouse handling
  },

  cleanUp: () => {
    // No cleanup needed for image tool
  },
};

export default imageTool;
