import { Canvas, Object as FabricObject } from "fabric";

interface HistoryState {
  objects: any[];
  background: string | null;
}

class HistoryManager {
  private canvas: Canvas;
  private undoStack: HistoryState[];
  private redoStack: HistoryState[];
  private maxStates: number;
  private isUpdating: boolean;

  constructor(canvas: Canvas, maxStates = 30) {
    this.canvas = canvas;
    this.undoStack = [];
    this.redoStack = [];
    this.maxStates = maxStates;
    this.isUpdating = false;

    // Save initial state
    this.saveState();

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Save state after object modifications
    this.canvas.on("object:modified", () => this.saveState());
    this.canvas.on("object:added", () => this.saveState());
    this.canvas.on("object:removed", () => this.saveState());

    // Handle keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === "z") {
          e.preventDefault();
          this.undo();
        } else if (e.key === "y") {
          e.preventDefault();
          this.redo();
        }
      }
    });
  }

  private saveState() {
    if (this.isUpdating) return;

    const state: HistoryState = {
      objects: this.canvas.getObjects().map((obj) => {
        const serialized = obj.toObject();
        serialized.type = obj.get("type");
        return serialized;
      }),
      background:
        typeof this.canvas.backgroundColor === "string" ? this.canvas.backgroundColor : null,
    };

    this.undoStack.push(state);
    this.redoStack = []; // Clear redo stack when new action is performed

    // Limit the number of stored states
    if (this.undoStack.length > this.maxStates) {
      this.undoStack.shift();
    }
  }

  private async loadState(state: HistoryState) {
    this.isUpdating = true;

    // Clear canvas
    this.canvas.clear();

    // Restore background
    if (state.background) {
      this.canvas.backgroundColor = state.background;
    }

    // Restore objects
    try {
      await Promise.all(
        state.objects.map(async (objData) => {
          return new Promise<void>((resolve) => {
            // @ts-ignore - fabric.js types are incomplete
            window.fabric.util.enlivenObjects(
              [objData],
              (enlivenedObjects: FabricObject[]) => {
                const obj = enlivenedObjects[0];
                if (obj) {
                  this.canvas.add(obj);
                }
                resolve();
              },
              "fabric"
            );
          });
        })
      );
    } catch (error) {
      console.error("Error restoring canvas state:", error);
    }

    this.canvas.renderAll();
    this.isUpdating = false;
  }

  public undo() {
    if (this.undoStack.length > 1) {
      // Keep at least one state
      const currentState = this.undoStack.pop()!;
      this.redoStack.push(currentState);
      const previousState = this.undoStack[this.undoStack.length - 1];
      this.loadState(previousState);
    }
  }

  public redo() {
    if (this.redoStack.length > 0) {
      const nextState = this.redoStack.pop()!;
      this.undoStack.push(nextState);
      this.loadState(nextState);
    }
  }

  public clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.saveState(); // Save current state as initial state
  }

  public canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public destroy() {
    // Remove event listeners
    document.removeEventListener("keydown", this.setupEventListeners);
    this.canvas.off("object:modified");
    this.canvas.off("object:added");
    this.canvas.off("object:removed");
  }
}

export default HistoryManager;
