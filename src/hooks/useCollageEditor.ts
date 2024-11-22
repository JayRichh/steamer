import { useCallback, useEffect, useState } from "react";

import type { SteamScreenshot } from "~/types/steam";

export type EditorStep = "select" | "edit" | "history";

export interface EditorState {
  currentStep: EditorStep;
  selectedScreenshots: SteamScreenshot[];
  availableScreenshots: SteamScreenshot[];
  isLoading: boolean;
  error: string | null;
}

export function useCollageEditor() {
  const [state, setState] = useState<EditorState>({
    currentStep: "select",
    selectedScreenshots: [],
    availableScreenshots: [],
    isLoading: false,
    error: null,
  });

  // Fetch available screenshots
  useEffect(() => {
    const fetchScreenshots = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await fetch("/api/steam/screenshots");
        if (!response.ok) {
          throw new Error("Failed to fetch screenshots");
        }
        const data = await response.json();
        if (!data.success || !Array.isArray(data.screenshots)) {
          throw new Error("Invalid screenshot data received");
        }
        setState((prev) => ({
          ...prev,
          availableScreenshots: data.screenshots,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load screenshots",
          isLoading: false,
        }));
      }
    };

    if (state.currentStep === "select" && state.availableScreenshots.length === 0) {
      fetchScreenshots();
    }
  }, [state.currentStep]);

  const setStep = useCallback((step: EditorStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const toggleScreenshot = useCallback((screenshot: SteamScreenshot) => {
    setState((prev) => {
      const isSelected = prev.selectedScreenshots.some((s) => s.id === screenshot.id);
      const selectedScreenshots = isSelected
        ? prev.selectedScreenshots.filter((s) => s.id !== screenshot.id)
        : [...prev.selectedScreenshots, screenshot];
      return { ...prev, selectedScreenshots };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedScreenshots: [] }));
  }, []);

  return {
    currentStep: state.currentStep,
    selectedScreenshots: state.selectedScreenshots,
    availableScreenshots: state.availableScreenshots,
    isLoading: state.isLoading,
    error: state.error,
    setStep,
    toggleScreenshot,
    clearSelection,
    hasSelection: state.selectedScreenshots.length > 0,
  };
}
