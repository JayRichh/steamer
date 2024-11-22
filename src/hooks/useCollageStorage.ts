import { useEffect, useState } from "react";

import type { SteamScreenshot, SteamUser } from "~/types/steam";

export interface SavedCollage {
  id: string;
  steamId: string;
  imageUrl: string;
  screenshots: Pick<SteamScreenshot, "id" | "url">[];
  createdAt: number;
}

const MAX_COLLAGES = 10;
const IMAGE_QUALITY = 0.8;

function compressImageData(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw and compress
      ctx.drawImage(img, 0, 0);
      try {
        const compressed = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = dataUrl;
  });
}

export function useCollageStorage(user: SteamUser | null) {
  const [savedCollages, setSavedCollages] = useState<SavedCollage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.steamid) return;

    const key = `collages_${user.steamid}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Keep only the most recent collages
        const recent = parsed.slice(0, MAX_COLLAGES);
        setSavedCollages(recent);
        // Update storage if we trimmed any collages
        if (recent.length < parsed.length) {
          localStorage.setItem(key, JSON.stringify(recent));
        }
      } catch (err) {
        console.error("Failed to load saved collages:", err);
        setError("Failed to load saved collages");
      }
    }
  }, [user?.steamid]);

  const saveCollage = async (imageUrl: string, screenshots: SteamScreenshot[]) => {
    if (!user?.steamid) {
      setError("User not logged in");
      throw new Error("User not logged in");
    }

    try {
      // Compress the image data
      const compressedImage = await compressImageData(imageUrl);

      const key = `collages_${user.steamid}`;
      const newCollage: SavedCollage = {
        id: Date.now().toString(),
        steamId: user.steamid,
        imageUrl: compressedImage,
        screenshots: screenshots.map((s) => ({ id: s.id, url: s.url })),
        createdAt: Date.now(),
      };

      // Keep only the most recent collages
      const updated = [newCollage, ...savedCollages].slice(0, MAX_COLLAGES);

      try {
        localStorage.setItem(key, JSON.stringify(updated));
        setSavedCollages(updated);
        setError(null);
        return newCollage;
      } catch (err) {
        // If storage is full, try removing old collages
        if (err instanceof Error && err.name === "QuotaExceededError") {
          const reduced = updated.slice(0, Math.max(1, updated.length - 2)); // Remove 2 oldest
          try {
            localStorage.setItem(key, JSON.stringify(reduced));
            setSavedCollages(reduced);
            setError(null);
            return newCollage;
          } catch (finalError) {
            throw new Error("Storage full: Please delete some existing collages");
          }
        }
        throw err;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save collage";
      setError(message);
      throw new Error(message);
    }
  };

  const deleteCollage = (collageId: string) => {
    if (!user?.steamid) {
      setError("User not logged in");
      return;
    }

    try {
      const key = `collages_${user.steamid}`;
      const updated = savedCollages.filter((c) => c.id !== collageId);
      localStorage.setItem(key, JSON.stringify(updated));
      setSavedCollages(updated);
      setError(null);
    } catch (err) {
      console.error("Failed to delete collage:", err);
      setError("Failed to delete collage");
    }
  };

  return {
    savedCollages,
    saveCollage,
    deleteCollage,
    error,
  };
}
