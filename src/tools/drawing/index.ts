import { Tools } from "~/types/tools";

import brushTool from "./brush";
import circleTool from "./circle";
import lineTool from "./line";
import rectangleTool from "./rectangle";
import selectTool from "./select";
import textTool from "./text";

export const tools: Tools = {
  select: selectTool,
  rectangle: rectangleTool,
  circle: circleTool,
  line: lineTool,
  text: textTool,
  brush: brushTool,
};

export type ToolName = keyof typeof tools;

export function getTool(name: ToolName) {
  return tools[name];
}

export default tools;
