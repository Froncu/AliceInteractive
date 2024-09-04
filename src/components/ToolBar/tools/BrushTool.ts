import * as fabric from "fabric";
import { BaseTool, BaseToolSettings } from "./BaseTool";
import { defineAsyncComponent, Component } from "vue";

export class BrushToolSettings implements BaseToolSettings {
  type: 'pencil' | 'spray' | 'circle' = 'pencil'
  size = 8;
  color = '#ff0000';
}

export class BrushTool implements BaseTool {
  private m_settings = new BrushToolSettings;
  private m_canvas?: fabric.Canvas;

  onChosen(canvas: fabric.Canvas): void {
    this.m_canvas = canvas;

    this.m_canvas.isDrawingMode = true;
    this.onUpdateSettings();

    this.m_canvas.on('object:added', this.makeDrawingUnselectable.bind(this))
  }

  onUnchosen(): void {
    if (!this.m_canvas)
      return;

    this.m_canvas.isDrawingMode = false;
    this.m_canvas.off('object:added', this.makeDrawingUnselectable.bind(this))
  }

  menu(): Component {
    return defineAsyncComponent(() => import('@/components/ToolBar/tools/BrushToolMenu/BrushToolMenu.vue'));
  }

  settings(): BrushToolSettings {
    return this.m_settings;
  }

  changeSettings(settings: BrushToolSettings): void {
    this.m_settings = settings;
    this.onUpdateSettings();
  }

  onUpdateSettings() {
    if (!this.m_canvas)
      return;

    switch (this.m_settings.type) {
      case 'pencil':
        this.m_canvas.freeDrawingBrush = new fabric.PencilBrush(this.m_canvas);
        break;

      case 'spray':
        this.m_canvas.freeDrawingBrush = new fabric.SprayBrush(this.m_canvas);
        break;

      case 'circle':
        this.m_canvas.freeDrawingBrush = new fabric.CircleBrush(this.m_canvas);
        break;
    }

    this.m_canvas.freeDrawingBrush.color = this.m_settings.color;
    this.m_canvas.freeDrawingBrush.width = this.m_settings.type === 'circle' ? this.m_settings.size - 16 : this.m_settings.size;
  }

  makeDrawingUnselectable(drawing: { target: fabric.FabricObject }): void {
    drawing.target.selectable = false;
  }
}