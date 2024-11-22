import { Canvas, Image as FabricImage, filters } from "fabric";

interface ImageDimensions {
  width: number;
  height: number;
}

type FilterType = "Brightness" | "Contrast" | "Saturation" | "Grayscale";

interface ImageFilter {
  type: FilterType;
  options?: any;
}

export const imageTools = {
  /**
   * Loads an image from a URL and adds it to the canvas
   */
  loadFromURL: async (canvas: Canvas, url: string): Promise<FabricImage> => {
    try {
      // Create a promise to load the image
      const imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
      });

      // Scale image to fit within canvas while maintaining aspect ratio
      const canvasWidth = canvas.width || 800;
      const canvasHeight = canvas.height || 600;
      const scale = Math.min(
        (canvasWidth * 0.8) / imgElement.width,
        (canvasHeight * 0.8) / imgElement.height
      );

      // Create fabric image instance
      const fabricImage = new FabricImage(imgElement, {
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgElement.width * scale) / 2,
        top: (canvasHeight - imgElement.height * scale) / 2,
        cornerStyle: "circle",
        cornerColor: "#00a0f5",
        borderColor: "#00a0f5",
        cornerSize: 12,
        padding: 5,
        transparentCorners: false,
        rotatingPointOffset: 40,
      });

      canvas.add(fabricImage);
      canvas.renderAll();
      return fabricImage;
    } catch (error) {
      console.error("Error loading image:", error);
      throw error;
    }
  },

  /**
   * Resizes an image to specified dimensions
   */
  resize: (image: FabricImage, dimensions: ImageDimensions): FabricImage => {
    const scaleX = dimensions.width / (image.width || 1);
    const scaleY = dimensions.height / (image.height || 1);
    image.scale(Math.min(scaleX, scaleY));
    return image;
  },

  /**
   * Crops an image to specified dimensions
   */
  crop: (
    canvas: Canvas,
    image: FabricImage,
    left: number,
    top: number,
    width: number,
    height: number
  ): void => {
    const clipPath = new FabricImage(image.getElement(), {
      left,
      top,
      width,
      height,
      scaleX: 1,
      scaleY: 1,
      absolutePositioned: true,
    });

    image.set({ clipPath });
    canvas.renderAll();
  },

  /**
   * Rotates an image by specified degrees
   */
  rotate: (canvas: Canvas, image: FabricImage, angle: number): void => {
    image.rotate((image.angle || 0) + angle);
    canvas.renderAll();
  },

  /**
   * Applies a filter to an image
   */
  applyFilter: (canvas: Canvas, image: FabricImage, filter: ImageFilter): void => {
    let fabricFilter;
    switch (filter.type) {
      case "Brightness":
        fabricFilter = new filters.Brightness(filter.options);
        break;
      case "Contrast":
        fabricFilter = new filters.Contrast(filter.options);
        break;
      case "Saturation":
        fabricFilter = new filters.Saturation(filter.options);
        break;
      case "Grayscale":
        fabricFilter = new filters.Grayscale();
        break;
    }

    if (fabricFilter) {
      image.filters = [fabricFilter];
      image.applyFilters();
      canvas.requestRenderAll();
    }
  },

  /**
   * Removes all filters from an image
   */
  removeFilters: (canvas: Canvas, image: FabricImage): void => {
    image.filters = [];
    image.applyFilters();
    canvas.renderAll();
  },

  /**
   * Adjusts image brightness
   */
  adjustBrightness: (canvas: Canvas, image: FabricImage, value: number): void => {
    const filter = new filters.Brightness({ brightness: value });
    image.filters = [filter];
    image.applyFilters();
    canvas.renderAll();
  },

  /**
   * Adjusts image contrast
   */
  adjustContrast: (canvas: Canvas, image: FabricImage, value: number): void => {
    const filter = new filters.Contrast({ contrast: value });
    image.filters = [filter];
    image.applyFilters();
    canvas.renderAll();
  },

  /**
   * Adjusts image saturation
   */
  adjustSaturation: (canvas: Canvas, image: FabricImage, value: number): void => {
    const filter = new filters.Saturation({ saturation: value });
    image.filters = [filter];
    image.applyFilters();
    canvas.renderAll();
  },

  /**
   * Converts image to grayscale
   */
  convertToGrayscale: (canvas: Canvas, image: FabricImage): void => {
    const filter = new filters.Grayscale();
    image.filters = [filter];
    image.applyFilters();
    canvas.renderAll();
  },

  /**
   * Flips image horizontally
   */
  flipHorizontally: (canvas: Canvas, image: FabricImage): void => {
    image.set("flipX", !image.flipX);
    canvas.renderAll();
  },

  /**
   * Flips image vertically
   */
  flipVertically: (canvas: Canvas, image: FabricImage): void => {
    image.set("flipY", !image.flipY);
    canvas.renderAll();
  },
};

export default imageTools;
