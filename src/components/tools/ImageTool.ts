import * as fabric from 'fabric';
import { defineAsyncComponent, Component } from "vue";
import { BaseTool, BaseToolSettings } from "./BaseTool";

export class ImageToolSettings implements BaseToolSettings {
  photoURL = "";
  query = "";
}

export class ImageTool extends BaseTool {
  name = 'Afbeeldingen';

  private m_settings = new ImageToolSettings();
  private m_canvas?: fabric.Canvas;

  override onChosen(canvas: fabric.Canvas): void {
    this.place = this.place.bind(this);

    this.m_canvas = canvas;

    this.m_canvas.on('mouse:down', this.place);

    return;
  }

  override onUnchosen(): void {
    this.m_canvas?.off('mouse:down', this.place);
    this.m_settings.photoURL = "";
    this.m_settings.query = "";
    return;
  }

  override settings(): ImageToolSettings {
    return this.m_settings;
  }

  override changeSettings(settings: ImageToolSettings): void {
    this.m_settings = settings;
  }
  override menu(): Component {
    return defineAsyncComponent(() => import('@/components/toolMenus/ImageToolMenu/ImageToolMenu.vue'));
  }

  place(event: fabric.TPointerEventInfo): void {
    const imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';  // Explicitly set crossOrigin

    imgElement.src = this.m_settings.photoURL;

    imgElement.onload = () => {
      const pexelImage = new fabric.FabricImage(imgElement, {
        selectable: false,
        evented: false,
      });

      pexelImage.set({
        left: event.viewportPoint.x - pexelImage.width / 2,
        top: event.viewportPoint.y - pexelImage.height / 2,
      })
      this.m_canvas?.add(pexelImage);
    }

  }
}