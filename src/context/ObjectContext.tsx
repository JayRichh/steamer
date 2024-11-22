"use client";

import { Object as FabricObject } from "fabric";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";

interface ObjectContextType {
  selectedObject: FabricObject | null;
  selectObject: (object: FabricObject | null) => void;
}

const ObjectContext = createContext<ObjectContextType | undefined>(undefined);

export function ObjectProvider({ children }: { children: React.ReactNode }) {
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const selectedObjectRef = useRef<FabricObject | null>(null);

  const selectObject = useCallback((object: FabricObject | null) => {
    if (object === selectedObjectRef.current) {
      return;
    }

    if (object) {
      if (!object.canvas) {
        console.error("ObjectContext: Object has no canvas reference");
        return;
      }

      selectedObjectRef.current = object;
      setSelectedObject(object);
    } else {
      selectedObjectRef.current = null;
      setSelectedObject(null);
    }
  }, []);

  // Create a stable context value
  const contextValue = React.useMemo(
    () => ({
      selectedObject,
      selectObject,
    }),
    [selectedObject, selectObject]
  );

  return <ObjectContext.Provider value={contextValue}>{children}</ObjectContext.Provider>;
}

export function useObject() {
  const context = useContext(ObjectContext);
  if (context === undefined) {
    throw new Error("useObject must be used within an ObjectProvider");
  }
  return context;
}
