"use client";

import { useCallback, useRef, useState } from "react";

import dynamic from "next/dynamic";

import { AuthProtection } from "~/components/AuthProtection";
import type { CollageCanvasRef } from "~/components/CollageCanvas";
import { DrawingToolbar } from "~/components/DrawingToolbar";
import { ScreenshotGrid } from "~/components/ScreenshotGrid";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Spinner } from "~/components/ui/Spinner";
import { Text } from "~/components/ui/Text";

import { useCollageEditor } from "~/hooks/useCollageEditor";
import { useCollageStorage } from "~/hooks/useCollageStorage";
import { useSteamUser } from "~/hooks/useSteamUser";

import { CanvasProvider } from "~/context/CanvasContext";
import { ObjectProvider } from "~/context/ObjectContext";

// Dynamically import the canvas component to avoid SSR issues
const CollageCanvas = dynamic(() => import("~/components/CollageCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <Spinner size="lg" className="mb-4" />
      <p className="text-gray-600 dark:text-gray-300">Loading editor...</p>
    </div>
  ),
});

function EditorContent() {
  const { user } = useSteamUser();
  const editor = useCollageEditor();
  const storage = useCollageStorage(user);
  const canvasRef = useRef<CollageCanvasRef>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveCollage = useCallback(async () => {
    console.log("Saving collage...");
    const imageUrl = canvasRef.current?.getDataUrl();
    if (imageUrl) {
      try {
        await storage.saveCollage(imageUrl, editor.selectedScreenshots);
        editor.setStep("history");
        console.log("Collage saved successfully");
      } catch (err) {
        console.error("Failed to save collage:", err);
        setError(err instanceof Error ? err.message : "Failed to save collage");
      }
    } else {
      console.error("Failed to get canvas data URL");
      setError("Failed to save collage");
    }
  }, [editor, storage]);

  const handleDownloadCollage = useCallback(() => {
    console.log("Downloading collage...");
    const imageUrl = canvasRef.current?.getDataUrl();
    if (imageUrl) {
      const link = document.createElement("a");
      link.download = "steam-collage.png";
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Collage downloaded successfully");
    } else {
      console.error("Failed to get canvas data URL");
      setError("Failed to download collage");
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Text variant="h1" align="center" className="mb-2">
          Screenshot Editor
        </Text>
        <Text variant="body-lg" color="secondary" align="center" className="max-w-2xl mx-auto">
          Create and save your gaming memory collages
        </Text>
      </div>

      {/* Error Display */}
      {(error || editor.error || storage.error) && (
        <Card className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 mb-2">
            {error || editor.error || storage.error}
          </div>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </Card>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex justify-center items-center space-x-4">
          <Button
            variant={editor.currentStep === "select" ? "default" : "outline"}
            onClick={() => editor.setStep("select")}
          >
            1. Select Images
          </Button>
          <div className="h-px w-8 bg-gray-300" />
          <Button
            variant={editor.currentStep === "edit" ? "default" : "outline"}
            disabled={!editor.hasSelection}
            onClick={() => editor.setStep("edit")}
          >
            2. Edit Collage
          </Button>
          <div className="h-px w-8 bg-gray-300" />
          <Button
            variant={editor.currentStep === "history" ? "default" : "outline"}
            onClick={() => editor.setStep("history")}
          >
            3. View History
          </Button>
        </div>
      </div>

      {/* Step Content */}
      {editor.currentStep === "select" && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {editor.selectedScreenshots.length} screenshots selected
            </div>
            {editor.hasSelection && (
              <Button onClick={() => editor.setStep("edit")}>Continue to Editor</Button>
            )}
          </div>
          <ScreenshotGrid
            screenshots={editor.availableScreenshots}
            isLoading={editor.isLoading}
            selectable={true}
            selectedIds={editor.selectedScreenshots.map((s) => s.id)}
            onSelect={editor.toggleScreenshot}
          />
        </div>
      )}

      {editor.currentStep === "edit" && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" onClick={() => editor.setStep("select")}>
              Back to Selection
            </Button>
            <div className="flex gap-4">
              <Button onClick={handleSaveCollage} variant="secondary">
                Save Collage
              </Button>
              <Button onClick={handleDownloadCollage}>Download</Button>
            </div>
          </div>
          <CanvasProvider>
            <ObjectProvider>
              <div className="flex gap-6">
                <DrawingToolbar className="w-64 shrink-0" />
                <Card className="flex-1 bg-gray-900 rounded-lg p-4">
                  <div
                    key={editor.selectedScreenshots.map((s) => s.id).join(",")}
                    className="relative w-full"
                    style={{ aspectRatio: "3/2" }}
                  >
                    <CollageCanvas
                      width={1200}
                      height={800}
                      backgroundColor="#1a1a1a"
                      screenshots={editor.selectedScreenshots}
                      onError={setError}
                      ref={canvasRef}
                    />
                  </div>
                  <div className="mt-4 text-sm text-gray-400 text-center">
                    Tip: Click and drag to move images, use corner controls to resize and rotate,
                    press Delete to remove selected images
                  </div>
                </Card>
              </div>
            </ObjectProvider>
          </CanvasProvider>
        </div>
      )}

      {editor.currentStep === "history" && (
        <div>
          {storage.savedCollages.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                No saved collages yet. Create your first one!
              </p>
              <Button onClick={() => editor.setStep("select")} className="mt-4">
                Create Collage
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storage.savedCollages.map((collage) => (
                <Card key={collage.id} className="overflow-hidden group relative">
                  <img src={collage.imageUrl} alt="Saved Collage" className="w-full h-auto" />
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {new Date(collage.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => storage.deleteCollage(collage.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.download = "steam-collage.png";
                            link.href = collage.imageUrl;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <AuthProtection>
      <EditorContent />
    </AuthProtection>
  );
}
