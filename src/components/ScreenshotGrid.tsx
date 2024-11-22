import { useState } from "react";

import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Modal } from "~/components/ui/Modal";
import { Progress } from "~/components/ui/Progress";
import { Text } from "~/components/ui/Text";

import type { SteamScreenshot } from "~/types/steam";

interface ScreenshotGridProps {
  screenshots: SteamScreenshot[];
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  loadingProgress?: {
    loaded: number;
    total: number;
  };
  selectable?: boolean;
  selectedIds?: number[];
  onSelect?: (screenshot: SteamScreenshot) => void;
}

export function ScreenshotGrid({
  screenshots,
  isLoading,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  loadingProgress,
  selectable = false,
  selectedIds = [],
  onSelect,
}: ScreenshotGridProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<SteamScreenshot | null>(null);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const handleImageError = (screenshotId: number) => {
    console.warn(`Failed to load image for screenshot ${screenshotId}`);
    setImageError((prev) => ({ ...prev, [screenshotId]: true }));
  };

  const handleScreenshotClick = (screenshot: SteamScreenshot) => {
    if (selectable && onSelect) {
      onSelect(screenshot);
    } else {
      setSelectedScreenshot(screenshot);
    }
  };

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        ←
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange?.(1)}
          disabled={isLoading}
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

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange?.(i)}
          disabled={isLoading}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
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
          onClick={() => onPageChange?.(totalPages)}
          disabled={isLoading}
          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        →
      </button>
    );

    return <div className="flex items-center justify-center space-x-1 mt-6">{pages}</div>;
  };

  if (isLoading && screenshots.length === 0) {
    return (
      <div className="space-y-6">
        {loadingProgress ? (
          <div className="p-4">
            <Progress
              value={loadingProgress.loaded}
              max={loadingProgress.total}
              showLabel
              className="mb-4"
            />
            <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
              Loading screenshots...
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (screenshots.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Text className="mb-4">No screenshots found</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Take some screenshots in your Steam games to see them here!
        </Text>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screenshots.map((screenshot) => (
            <Card
              key={screenshot.id}
              className={`overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02] ${
                selectable && selectedIds.includes(screenshot.id) ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleScreenshotClick(screenshot)}
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                {!imageError[screenshot.id] ? (
                  <img
                    src={screenshot.thumbnail_url}
                    alt={screenshot.title || "Steam Screenshot"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => handleImageError(screenshot.id)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <Text>Failed to load image</Text>
                  </div>
                )}
                {screenshot.spoiler && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Spoiler</span>
                  </div>
                )}
                {selectable && selectedIds.includes(screenshot.id) && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Selected
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <Text className="font-medium line-clamp-1">
                  {screenshot.title || "Untitled Screenshot"}
                </Text>
                <div className="flex items-center justify-between mt-1">
                  <Text className="text-xs text-gray-500">
                    {new Date(screenshot.creation_time * 1000).toLocaleDateString()}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {screenshot.width}x{screenshot.height}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {totalPages > 1 && renderPagination()}

        {isLoading && loadingProgress && (
          <div className="pt-4">
            <Progress
              value={loadingProgress.loaded}
              max={loadingProgress.total}
              showLabel
              className="max-w-xs mx-auto"
            />
          </div>
        )}
      </div>

      {selectedScreenshot && !selectable && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedScreenshot(null)}
          className="w-full max-w-7xl bg-gray-900 p-0"
        >
          <div className="relative flex flex-col max-h-[90vh]">
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
              <a
                href={selectedScreenshot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="secondary" size="sm">
                  Open Original
                </Button>
              </a>
              <Button variant="secondary" size="sm" onClick={() => setSelectedScreenshot(null)}>
                Close
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              {!imageError[selectedScreenshot.id] ? (
                <img
                  src={selectedScreenshot.url}
                  alt={selectedScreenshot.title || "Steam Screenshot"}
                  className="w-full h-auto"
                  onError={() => handleImageError(selectedScreenshot.id)}
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-gray-400">
                  <Text>Failed to load full-size image</Text>
                </div>
              )}
            </div>

            <div className="flex-none p-4 bg-gray-900/80 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto">
                {selectedScreenshot.title && (
                  <Text variant="h3" className="text-white mb-2">
                    {selectedScreenshot.title}
                  </Text>
                )}
                {selectedScreenshot.caption && (
                  <Text className="text-gray-300 mb-4">{selectedScreenshot.caption}</Text>
                )}
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div>
                    Taken on {new Date(selectedScreenshot.creation_time * 1000).toLocaleString()}
                  </div>
                  <div>
                    Resolution: {selectedScreenshot.width}x{selectedScreenshot.height}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
