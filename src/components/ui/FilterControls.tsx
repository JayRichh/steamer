import { filters } from "fabric";

import React from "react";

interface FilterControlsProps {
  onFilterChange: (filter: any) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ onFilterChange }) => {
  const [filterType, setFilterType] = React.useState<"Color" | "Brightness" | "Contrast">("Color");
  const [filterOptions, setFilterOptions] = React.useState({
    color: "#000000",
    opacity: 0.5,
    brightness: 0,
    contrast: 0,
  });

  const handleFilterChange = (type: "Color" | "Brightness" | "Contrast", value: any) => {
    let newOptions;
    if (type === "Color" && typeof value === "number") {
      // Handle opacity change
      newOptions = { ...filterOptions, opacity: value };
    } else {
      // Handle other changes
      newOptions = { ...filterOptions, [type.toLowerCase()]: value };
    }
    setFilterOptions(newOptions);

    let filter;
    switch (type) {
      case "Color":
        filter = new filters.BlendColor({
          color: newOptions.color,
          mode: "tint",
          alpha: newOptions.opacity,
        });
        break;
      case "Brightness":
        filter = new filters.Brightness({
          brightness: newOptions.brightness,
        });
        break;
      case "Contrast":
        filter = new filters.Contrast({
          contrast: newOptions.contrast,
        });
        break;
    }

    if (filter) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Filter Type</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="w-full p-2 border rounded"
        >
          <option value="Color">Color</option>
          <option value="Brightness">Brightness</option>
          <option value="Contrast">Contrast</option>
        </select>
      </div>

      {filterType === "Color" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="color"
              value={filterOptions.color}
              onChange={(e) => handleFilterChange("Color", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filterOptions.opacity}
              onChange={(e) => handleFilterChange("Color", parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </>
      )}

      {filterType === "Brightness" && (
        <div>
          <label className="block text-sm font-medium mb-1">Brightness</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={filterOptions.brightness}
            onChange={(e) => handleFilterChange("Brightness", parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {filterType === "Contrast" && (
        <div>
          <label className="block text-sm font-medium mb-1">Contrast</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={filterOptions.contrast}
            onChange={(e) => handleFilterChange("Contrast", parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
