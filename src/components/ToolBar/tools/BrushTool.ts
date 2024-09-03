import * as fabric from "fabric";
import { BaseTool, BaseToolSettings } from "./BaseTool";
import { defineAsyncComponent, Component } from "vue";

export class BrushToolSettings implements BaseToolSettings {
  size = 5;
  color = '#000000';
}

export class BrushTool implements BaseTool {
  private m_settings = new BrushToolSettings;
  private m_canvas?: fabric.Canvas;
  private m_brush?: fabric.BaseBrush;

  onChosen(canvas: fabric.Canvas): void {
    this.m_canvas = canvas;

    this.m_canvas.isDrawingMode = true;
    this.m_canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    this.m_brush = this.m_canvas.freeDrawingBrush;
    this.m_brush.color = this.m_settings.color;
    this.m_brush.width = this.m_settings.size;

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

  settings(): BaseToolSettings | null {
    return this.m_settings;
  }

  changeSettings(settings: BrushToolSettings): void {
    this.m_settings = settings;
    if (!this.m_brush)
      return;

    this.m_brush.color = this.m_settings.color;
    this.m_brush.width = this.m_settings.size;
  }

  makeDrawingUnselectable(drawing: { target: fabric.FabricObject }): void {
    drawing.target.selectable = false;
  }
}