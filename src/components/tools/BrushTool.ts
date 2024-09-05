import * as fabric from "fabric";
import { ref, defineAsyncComponent } from "vue";
import { BaseTool, BaseToolSettings } from "./BaseTool";

export class BrushToolSettings extends BaseToolSettings {
  type: 'pencil' | 'spray' | 'circle' = 'pencil'
  size = 8;
  color = '#ff0000';
}

export class BrushTool extends BaseTool {
  private m_canvas?: fabric.Canvas;
  private m_settings = ref(new BrushToolSettings);

  override onChosen(canvas: fabric.Canvas) {
    this.makeDrawingUnselectable = this.makeDrawingUnselectable.bind(this)

    this.m_canvas = canvas;
    this.m_canvas.isDrawingMode = true;
    this.onUpdateSettings();

    this.m_canvas.on('object:added', this.makeDrawingUnselectable)
  }

  override onUnchosen() {
    if (!this.m_canvas)
      return;

    this.m_canvas.isDrawingMode = false;
    this.m_canvas.off('object:added', this.makeDrawingUnselectable)
  }

  override menu() {
    return defineAsyncComponent(() => import('@/components/toolMenus/BrushToolMenu/BrushToolMenu.vue'));
  }

  override settings() {
    return this.m_settings.value;
  }

  override changeSettings(settings: BrushToolSettings) {
    this.m_settings.value = settings;
  }

  onUpdateSettings() {
    if (!this.m_canvas)
      return;

    switch (this.m_settings.value.type) {
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

    this.m_canvas.freeDrawingBrush.color = this.m_settings.value.color;
    this.m_canvas.freeDrawingBrush.width =
      this.m_settings.value.type === 'circle' ?
        this.m_settings.value.size - 16 :
        this.m_settings.value.size;
  }

  makeDrawingUnselectable(drawing: { target: fabric.FabricObject }) {
    drawing.target.selectable = false;
  }
}