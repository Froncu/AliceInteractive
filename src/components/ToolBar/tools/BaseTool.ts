import { Canvas } from "fabric/*";

export interface BaseTool {
  onChosen: (canvas: Canvas) => void;
  onUnchosen: (canvas: Canvas) => void;
  startUse: (canvas: Canvas, position: { x: number, y: number }) => void;
  use: (canvas: Canvas, position: { x: number, y: number }) => void;
  endUse: (canvas: Canvas, position: { x: number, y: number }) => void;
}