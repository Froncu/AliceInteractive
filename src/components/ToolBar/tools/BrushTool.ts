import { BaseTool } from "./BaseTool";
import * as fabric from "fabric";

export class BrushTool implements BaseTool {
  private m_defaultBrush?: fabric.BaseBrush;
  private m_brushSize = 5;
  private m_brushColor = "rgba(0, 0, 0, 1)";
  //private m_brushTransparency = 1;

  onChosen(canvas: fabric.Canvas): void {
    canvas.isDrawingMode = true;

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);

    // Store the current brush as the default if not already done
    this.m_defaultBrush = canvas.freeDrawingBrush;

    // Set brush properties
    this.m_defaultBrush.color = this.m_brushColor;
    this.m_defaultBrush.width = this.m_brushSize;
  }

  onUnchosen(canvas: fabric.Canvas): void {
    canvas.isDrawingMode = false;
  }

  startUse(canvas: fabric.Canvas, position: { x: number; y: number; }): void{
    return;
  }
  
  use(canvas: fabric.Canvas, position: { x: number; y: number }): void {
    return;
    // Drawing happens automatically with the brush, so no need to manually implement use
  }

  endUse(canvas: fabric.Canvas, position: { x: number; y: number; }): void{
    canvas.item(0).selectable = false;
    canvas.renderAll();
  }

  // Additional methods to modify brush properties if needed
  /* setBrushSize(size: number): void {
    this.m_brushSize = size;
    if (this.m_defaultBrush) {
      this.m_defaultBrush.width = size;
    }
  }

  setBrushColor(color: string): void {
    this.m_brushColor = color;
    if (this.m_defaultBrush) {
      this.m_defaultBrush.color = color;
    }
  }

  setBrushTransparency(transparency: number): void {
    this.m_brushTransparency = transparency;
    if (this.m_defaultBrush) {
      this.m_defaultBrush.opacity = transparency;
    }
  } */
}