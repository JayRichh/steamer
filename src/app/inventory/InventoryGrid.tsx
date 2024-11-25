"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "~/components/ui/Card";
import { Text } from "~/components/ui/Text";
import { Button } from "~/components/ui/Button";
import { Slider } from "~/components/ui/Slider";
import { Select } from "~/components/ui/Select";
import type { SteamInventoryItem } from "~/types/steam";

interface InventoryGridProps {
  steamId: string;
  page?: number;
  appId?: string;
  onSelectItem?: (item: SteamInventoryItem) => void;
}

type SortOption = "name" | "rarity" | "type";

const RARITY_COLORS = {
  // CS2/CSGO Colors
  "D2D2D2": {
    border: "border-gray-300 dark:border-gray-600",
    text: "#D2D2D2", // Consumer Grade (White)
  },
  "B0C3D9": {
    border: "border-blue-200 dark:border-blue-800",
    text: "#B0C3D9", // Industrial Grade (Light Blue)
  },
  "5E98D9": {
    border: "border-blue-500",
    text: "#5E98D9", // Mil-spec Grade (Blue)
  },
  "4B69FF": {
    border: "border-blue-600",
    text: "#4B69FF", // Restricted (Purple-Blue)
  },
  "8847FF": {
    border: "border-purple-600",
    text: "#8847FF", // Classified (Pink-Purple)
  },
  "D32CE6": {
    border: "border-pink-600",
    text: "#D32CE6", // Covert (Red-Pink)
  },
  "CAAB05": {
    border: "border-yellow-500",
    text: "#CAAB05", // Contraband (Gold)
  },
  "EB4B4B": {
    border: "border-red-500",
    text: "#EB4B4B", // High Grade (Red)
  },
  "E4AE39": {
    border: "border-yellow-400",
    text: "#E4AE39", // Extraordinary (Gold)
  },
  // Dota 2 Colors
  "B28A33": {
    border: "border-yellow-600",
    text: "#B28A33", // Immortal
  },
  // TF2 Colors
  "7D6D00": {
    border: "border-yellow-700",
    text: "#7D6D00", // Vintage
  },
  "476291": {
    border: "border-blue-700",
    text: "#476291", // Genuine
  },
} as const;

const cleanColor = (color?: string) => {
  if (!color) return "";
  // Remove any # prefix and clean color
  return color.replace(/^#/, "").toUpperCase();
};

const getRarityColor = (color?: string) => {
  if (!color) return "border-border/50";
  
  const clean = cleanColor(color);
  
  // Check for known rarity colors
  if (clean in RARITY_COLORS) {
    return RARITY_COLORS[clean as keyof typeof RARITY_COLORS].border;
  }

  // For unknown colors, use the color directly with opacity
  return `border-[#${clean}] border-opacity-70`;
};

const getRarityTextColor = (color?: string) => {
  if (!color) return undefined;
  
  const clean = cleanColor(color);
  
  // For known colors, use predefined text color
  if (clean in RARITY_COLORS) {
    return RARITY_COLORS[clean as keyof typeof RARITY_COLORS].text;
  }

  // For unknown colors, use the color directly
  return `#${clean}`;
};

export default function InventoryGrid({ steamId, page = 1, appId, onSelectItem }: InventoryGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<SteamInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [gridSize, setGridSize] = useState(4); // Default to 4 columns
  const [sortBy, setSortBy] = useState<SortOption>("rarity");

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        steamid: steamId,
        page: page.toString(),
        limit: "100",
      });

      if (appId) {
        params.append("appid", appId);
      }

      const response = await fetch(`/api/steam/inventory?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch inventory items");
      }

      setItems(data.items || []);
      setHasMore(data.has_more || false);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Inventory error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setItems([]); // Clear items on error
    } finally {
      setLoading(false);
    }
  }, [steamId, page, appId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    if (appId) {
      params.set("appid", appId);
    }
    router.push(`/inventory?${params.toString()}`);
  }, [searchParams, appId, router]);

  const handleImageError = (assetId: string) => {
    console.warn(`Failed to load image for item ${assetId}`);
    setImageError((prev) => ({ ...prev, [assetId]: true }));
  };

  const getImageUrl = (iconUrl: string) => {
    // Use larger size for better quality
    return `https://community.fastly.steamstatic.com/economy/image/${iconUrl}/256x256`;
  };

  const getRarityBorder = (item: SteamInventoryItem) => {
    return getRarityColor(item.name_color);
  };

  const getRarityTextColor = (color?: string) => {
    if (!color) return undefined;
    // Add opacity to make text more readable
    return `#${color}cc`;
  };

  const sortItems = (items: SteamInventoryItem[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rarity":
          if (a.name_color && b.name_color) {
            return b.name_color.localeCompare(a.name_color);
          }
          return a.name_color ? -1 : b.name_color ? 1 : 0;
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  };

  const gridSizeClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  }[gridSize];

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    pages.push(
      <Button
        key="prev"
        variant="ghost"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1 || loading}
      >
        ←
      </Button>
    );

    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={page === 1 ? "default" : "ghost"}
          onClick={() => handlePageChange(1)}
          disabled={loading}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={page === i ? "default" : "ghost"}
          onClick={() => handlePageChange(i)}
          disabled={loading}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={page === totalPages ? "default" : "ghost"}
          onClick={() => handlePageChange(totalPages)}
          disabled={loading}
        >
          {totalPages}
        </Button>
      );
    }

    pages.push(
      <Button
        key="next"
        variant="ghost"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages || loading}
      >
        →
      </Button>
    );

    return <div className="flex items-center justify-center gap-2 mt-6">{pages}</div>;
  };

  if (loading && items.length === 0) {
    return (
      <div className={`grid ${gridSizeClass} gap-2`}>
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="px-1.5 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-2/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <Text color="error" className="mb-4">{error}</Text>
        <Button onClick={() => fetchItems()}>Try Again</Button>
      </Card>
    );
  }

  const sortedItems = sortItems(items);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select
          value={sortBy}
          onChange={(value) => setSortBy(value as SortOption)}
          options={[
            { value: "rarity", label: "Sort by Rarity" },
            { value: "name", label: "Sort by Name" },
            { value: "type", label: "Sort by Type" },
          ]}
        />
        <div className="flex items-center gap-4">
          <Text variant="body-sm" color="secondary">Grid Size</Text>
          <div className="w-48">
            <Slider
              min={2}
              max={6}
              step={1}
              value={gridSize}
              onChange={setGridSize}
            />
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-6 text-center">
          <Text className="mb-4">No inventory items found</Text>
          <Text color="secondary">
            {appId ? "Try selecting a different game" : "Your Steam inventory appears to be empty"}
          </Text>
        </Card>
      ) : (
      <div className={`grid ${gridSizeClass} gap-2`}>
        {sortedItems.map((item) => (
          <Card
            key={item.assetid}
            className={`overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02] border-2 ${getRarityBorder(item)} p-0`}
            onClick={() => onSelectItem?.(item)}
          >
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
              {!imageError[item.assetid] ? (
                <Image
                  src={getImageUrl(item.icon_url)}
                  alt={item.name}
                  fill
                  className="object-contain"
                  onError={() => handleImageError(item.assetid)}
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Text color="secondary">Failed to load image</Text>
                </div>
              )}
              {item.tradable === 1 && (
                <div className="absolute top-1 right-1">
                  <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded">
                    Tradable
                  </span>
                </div>
              )}
            </div>
            <div className="px-2 py-1.5 space-y-0.5">
              <Text 
                variant="caption" 
                className="font-medium line-clamp-1 leading-tight"
                style={{ color: getRarityTextColor(item.name_color) }}
              >
                {item.name}
              </Text>
              <Text 
                variant="caption" 
                color="secondary" 
                className="line-clamp-1 text-[10px] leading-tight"
              >
                {item.type}
              </Text>
            </div>
          </Card>
          ))}
          </div>
        )}
  
        {totalPages > 1 && renderPagination()}
      </div>
    );
}
