import * as fabric from "fabric";
import { BaseTool, BaseToolSettings } from "./BaseTool";
import { ref, defineAsyncComponent } from "vue";

export class BackgroundToolSettings extends BaseToolSettings {
  color = '#808080'
}

export class BackgroundTool extends BaseTool {
  name = 'Background tool';

  private m_canvas?: fabric.Canvas;
  private m_settings = ref(new BackgroundToolSettings);

  override onChosen(canvas: fabric.Canvas) {
    this.fillBackground = this.fillBackground.bind(this);

    this.m_canvas = canvas;
    this.m_canvas.on('mouse:down', this.fillBackground);
  }

  override onUnchosen() {
    this.m_canvas?.off('mouse:down', this.fillBackground);
  }

  override menu() {
    return defineAsyncComponent(() => import('@/components/toolMenus/BackgroundTool/BackgroundToolMenu.vue'));
  }

  override settings()  {
    return this.m_settings.value;
  }

  override changeSettings(settings: BackgroundToolSettings) {
    this.m_settings.value = settings;
  }

  fillBackground() {
    if (!this.m_canvas)
      return;

    this.m_canvas.backgroundColor = this.m_settings.value.color;
    this.m_canvas.renderAll();
  }
}