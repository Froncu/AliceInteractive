import * as fabric from "fabric";
import { BaseTool, BaseToolSettings } from "./BaseTool";
import { Component, defineAsyncComponent } from "vue";

export class BackgroundToolSettings implements BaseToolSettings {
  color = '#808080'
}

export class BackgroundTool implements BaseTool {
  private m_canvas?: fabric.Canvas;
  private m_settings = new BackgroundToolSettings;

  onChosen(canvas: fabric.Canvas): void {
    this.fillBackground = this.fillBackground.bind(this);

    this.m_canvas = canvas;
    this.m_canvas.on('mouse:down', this.fillBackground);
  }

  onUnchosen(): void {
    this.m_canvas?.off('mouse:down', this.fillBackground);
  }

  menu(): Component {
    return defineAsyncComponent(() => import('@/components/toolMenus/BackgroundTool/BackgroundToolMenu.vue'));
  }

  settings(): BackgroundToolSettings {
    return this.m_settings;
  }

  changeSettings(setting: BackgroundToolSettings): void {
    this.m_settings = setting;
  }

  fillBackground(): void {
    if (!this.m_canvas)
      return;

    this.m_canvas.backgroundColor = this.m_settings.color;
    this.m_canvas.renderAll();
  }
}