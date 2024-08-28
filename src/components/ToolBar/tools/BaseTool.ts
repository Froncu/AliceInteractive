import { Canvas } from "fabric/*";

export interface BaseTool {
  onChosen: (canvas: Canvas) => void;
  onUnchosen: (canvas: Canvas) => void;
  use: (canvas: Canvas, position: { x: number, y: number }) => void;
}