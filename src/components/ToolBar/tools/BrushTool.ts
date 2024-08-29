import { BaseTool } from "./BaseTool";
import * as fabric from "fabric";

export class BrushTool implements BaseTool {
  private m_defaultBrush?: fabric.BaseBrush;
  private m_brushSize = 5;
  private m_brushColor = "rgba(0, 0, 0, 1)";
  private m_brushTransparency = 1;

  onChosen(canvas: fabric.Canvas): void {
    console.log('Pen tool chosen');
    canvas.isDrawingMode = true;

    // Set up the brush
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    const brush = canvas.freeDrawingBrush;

    // Store the current brush as the default if not already done
    this.m_defaultBrush = brush;

    // Set brush properties
    brush.color = this.m_brushColor;
    brush.width = this.m_brushSize;
  }

  onUnchosen(canvas: fabric.Canvas): void {
    console.log('Brush tool unchosen');
    canvas.isDrawingMode = false;
  }

  use(canvas: fabric.Canvas, position: { x: number; y: number }): void {
    console.log('Brush tool use', position);
    // Drawing happens automatically with the brush, so no need to manually implement use
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