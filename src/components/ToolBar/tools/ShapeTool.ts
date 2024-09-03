import * as fabric from "fabric";
import { BaseTool, BaseToolSettings } from "./BaseTool";
import { defineAsyncComponent, Component } from "vue";

export class ShapeToolSettings implements BaseToolSettings {
  shape: 'rectangle' | 'circle' | 'triangle' = 'rectangle';
  fillColor = '#000000';
  strokeColor = '#ffffff';
  strokeWidth = 1;
}

export class ShapeTool implements BaseTool {
  private m_settings = new ShapeToolSettings();
  private m_canvas?: fabric.Canvas;
  private m_object?: fabric.FabricObject;
  private m_startPosition = { x: 0, y: 0 };

  onChosen(canvas: fabric.Canvas): void {
    this.m_canvas = canvas;

    this.start = this.start.bind(this);
    this.drag = this.drag.bind(this);
    this.end = this.end.bind(this);

    this.m_canvas.on('mouse:down', this.start)
    this.m_canvas.on('mouse:up', this.end);

    console.log('ShapeTool onChosen');
  }

  onUnchosen(): void {
    if (!this.m_canvas)
      return;

    this.m_canvas.off('mouse:down', this.start)
    this.m_canvas.off('mouse:up', this.end);

    console.log('ShapeTool onUnchosen');
  }

  menu(): Component {
    return defineAsyncComponent(() => import('@/components/ToolBar/tools/ShapeToolMenu/ShapeToolMenu.vue'));
  }

  settings(): BaseToolSettings | null {
    return this.m_settings;
  }

  changeSettings(settings: ShapeToolSettings): void {
    this.m_settings = settings;
    console.log(this.m_settings);
  }

  start(event: fabric.TPointerEventInfo): void {
    if (!this.m_canvas)
      return;

    this.m_startPosition = event.scenePoint;

    let shapeType: typeof fabric.FabricObject;
    switch (this.m_settings.shape) {
      case 'rectangle':
        shapeType = fabric.Rect;
        break;

      case 'circle':
        shapeType = fabric.Circle;
        break;

      case 'triangle':
        shapeType = fabric.Triangle;
        break;
    }

    this.m_object = new shapeType({
      selectable: false,
      left: this.m_startPosition.x,
      top: this.m_startPosition.y,
      width: 0,
      height: 0,

      fill: this.m_settings.fillColor,
      stroke: this.m_settings.strokeColor,
      strokeWidth: this.m_settings.strokeWidth
    });

    this.m_canvas.add(this.m_object);
    this.m_canvas.on('mouse:move', this.drag);
  }

  drag(event: fabric.TPointerEventInfo): void {
    if (!this.m_canvas || !this.m_object)
      return;

    const deltaX = event.scenePoint.x - this.m_startPosition.x;
    const deltaY = event.scenePoint.y - this.m_startPosition.y;

    if (this.m_object.isType('circle'))
      (this.m_object as fabric.Circle).radius = Math.min(deltaX, deltaY);

    this.m_object.set({
      width: deltaX,
      height: deltaY,
    });

    this.m_canvas.renderAll();
  }

  end(): void {
    if (!this.m_canvas || !this.m_object)
      return;

    const minimalSize = { width: 15, height: 15 };

    if (Math.abs(this.m_object.width) < minimalSize.width && Math.abs(this.m_object.height) < minimalSize.height) {
      this.m_object.left -= this.m_object.width / 2;
      this.m_object.top -= this.m_object.height / 2;

      this.m_object.set({
        left: this.m_object.left - minimalSize.width / 2,
        top: this.m_object.top - minimalSize.height / 2,
        width: minimalSize.width,
        height: minimalSize.height,
        selectable: false
      });
    }

    this.m_canvas.renderAll();
    this.m_canvas.off('mouse:move', this.drag);
  }
}