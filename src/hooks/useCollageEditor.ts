import { useCallback, useEffect, useState } from "react";

import type { SteamScreenshot } from "~/types/steam";

export type EditorStep = "select" | "edit" | "history";

export interface EditorState {
  currentStep: EditorStep;
  selectedScreenshots: SteamScreenshot[];
  availableScreenshots: SteamScreenshot[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const ITEMS_PER_PAGE = 12;

export function useCollageEditor() {
  const [state, setState] = useState<EditorState>({
    currentStep: "select",
    selectedScreenshots: [],
    availableScreenshots: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  // Fetch available screenshots with pagination
  const fetchScreenshots = useCallback(async (page: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`/api/steam/screenshots?page=${page}&limit=${ITEMS_PER_PAGE}`);
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
        totalPages: data.total_pages,
        totalCount: data.total_count,
        currentPage: page,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load screenshots",
        isLoading: false,
      }));
    }
  }, []);

  // Initial load and page changes
  useEffect(() => {
    if (state.currentStep === "select" && !state.isLoading) {
      fetchScreenshots(state.currentPage);
    }
  }, [state.currentStep, state.currentPage, fetchScreenshots]);

  const setStep = useCallback((step: EditorStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
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
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    setStep,
    toggleScreenshot,
    clearSelection,
    handlePageChange,
    hasSelection: state.selectedScreenshots.length > 0,
  };
}
