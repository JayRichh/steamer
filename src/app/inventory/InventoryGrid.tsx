"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "~/components/ui/Card";
import { Text } from "~/components/ui/Text";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { Progress } from "~/components/ui/Progress";
import type { SteamInventoryItem } from "~/types/steam";

interface InventoryGridProps {
  steamId: string;
  page?: number;
  appId?: string;
}

export default function InventoryGrid({ steamId, page = 1, appId }: InventoryGridProps) {
  const router = useRouter();
  const [items, setItems] = useState<SteamInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<SteamInventoryItem | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        steamid: steamId,
        page: page.toString(),
        limit: "50",
      });

      if (appId) {
        params.append("appid", appId);
      }

      const response = await fetch(`/api/steam/inventory?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch inventory items");

      const data = await response.json();
      setItems(data.items || []);
      setHasMore(data.has_more || false);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [steamId, page, appId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    if (appId) params.set("appid", appId);
    router.push(`/inventory?${params.toString()}`);
  };

  const handleImageError = (assetId: string) => {
    console.warn(`Failed to load image for item ${assetId}`);
    setImageError((prev) => ({ ...prev, [assetId]: true }));
  };

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1 || loading}
        className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        ←
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          disabled={loading}
          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          1
        </button>
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
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={loading}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            page === i
              ? "bg-primary text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {i}
        </button>
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
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          disabled={loading}
          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages || loading}
        className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        →
      </button>
    );

    return <div className="flex items-center justify-center space-x-1 mt-6">{pages}</div>;
  };

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="p-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-2/3" />
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

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Text className="mb-4">No inventory items found</Text>
        <Text color="secondary">
          {appId ? "Try selecting a different game" : "Your Steam inventory appears to be empty"}
        </Text>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.assetid}
              className="overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02]"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                {!imageError[item.assetid] ? (
                  <Image
                    src={`https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`}
                    alt={item.name}
                    fill
                    className="object-contain p-4"
                    onError={() => handleImageError(item.assetid)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Text color="secondary">Failed to load image</Text>
                  </div>
                )}
                {item.tradable === 1 && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      Tradable
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <Text 
                  variant="body-sm" 
                  className="font-medium line-clamp-1"
                  style={{ color: item.name_color ? `#${item.name_color}` : undefined }}
                >
                  {item.name}
                </Text>
                <Text variant="caption" color="secondary" className="line-clamp-1">
                  {item.type}
                </Text>
              </div>
            </Card>
          ))}
        </div>

        {totalPages > 1 && renderPagination()}
      </div>

      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.name}
        >
          <div className="space-y-6">
            <div className="relative aspect-square max-w-md mx-auto">
              <Image
                src={`https://community.cloudflare.steamstatic.com/economy/image/${selectedItem.icon_url_large || selectedItem.icon_url}`}
                alt={selectedItem.name}
                fill
                className="object-contain p-4"
              />
            </div>

            <div className="space-y-4">
              {selectedItem.descriptions?.map((desc, index) => (
                <Text 
                  key={index}
                  variant="body-sm"
                  style={{ color: desc.color ? `#${desc.color}` : undefined }}
                >
                  {desc.value}
                </Text>
              ))}

              <div className="flex flex-wrap gap-4 pt-4">
                {selectedItem.actions?.map((action) => (
                  <Button
                    key={action.name}
                    onClick={() => window.open(action.link.replace("%assetid%", selectedItem.assetid), "_blank")}
                  >
                    {action.name}
                  </Button>
                ))}
                {selectedItem.marketable === 1 && (
                  <Button
                    variant="secondary"
                    onClick={() => window.open(`https://steamcommunity.com/market/listings/753/${selectedItem.market_hash_name}`, "_blank")}
                  >
                    View on Steam Market
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
