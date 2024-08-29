import { BaseTool } from "./BaseTool";
import * as fabric from "fabric";

export class BrushTool implements BaseTool {
  private m_defaultBrush?: fabric.BaseBrush;
  private m_brushSize = 5;
  private m_brushColor = "rgba(0, 0, 0, 1)";
  private m_brushTransparency = 1;

  onChosen(canvas: fabric.Canvas): void {
    canvas.isDrawingMode = true;

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    const brush = canvas.freeDrawingBrush;

    this.m_defaultBrush = brush;

    brush.color = this.m_brushColor;
    brush.width = this.m_brushSize;
  }

  onUnchosen(canvas: fabric.Canvas): void {
    canvas.isDrawingMode = false;
  }

  startUse(): void {
    return;
  }

  use(): void {
    return;
  }

  endUse(): void {
    return;
  }

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