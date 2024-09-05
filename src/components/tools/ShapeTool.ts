import * as fabric from "fabric";
import { defineAsyncComponent, Component } from "vue";
import { BaseTool, BaseToolSettings } from "./BaseTool";

export class ShapeToolSettings implements BaseToolSettings {
  shape: 'rectangle' | 'circle' | 'triangle' = 'rectangle';
  fillColor = '#ff0000';
  strokeColor = '#000000';
  strokeWidth = 4;
  centered = false;
}

export class ShapeTool implements BaseTool {
  private m_settings = new ShapeToolSettings();
  private m_canvas?: fabric.Canvas;
  private m_object?: fabric.FabricObject;
  private m_startPosition = { x: 0, y: 0 };
  private m_minimalSize = { width: 32, height: 32 };
  private m_ratio = 0;

  onChosen(canvas: fabric.Canvas): void {
    this.start = this.start.bind(this);
    this.drag = this.drag.bind(this);
    this.end = this.end.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.m_canvas = canvas;
    this.m_canvas.on('mouse:down', this.start)
    this.m_canvas.on('mouse:up', this.end);

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  onUnchosen(): void {
    if (!this.m_canvas)
      return;

    this.m_canvas.off('mouse:down', this.start)
    this.m_canvas.off('mouse:up', this.end);

    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.m_ratio = 0;
  }

  menu(): Component {
    return defineAsyncComponent(() => import('@/components/toolMenus/ShapeToolMenu/ShapeToolMenu.vue'));
  }

  settings(): ShapeToolSettings {
    return this.m_settings;
  }

  changeSettings(settings: ShapeToolSettings): void {
    this.m_settings = settings;
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
        shapeType = fabric.Ellipse;
        break;

      case 'triangle':
        shapeType = fabric.Triangle;
        break;
    }

    this.m_object = new shapeType({
      selectable: false,
      left: event.scenePoint.x,
      top: event.scenePoint.y,
      width: this.m_minimalSize.width - this.m_settings.strokeWidth,
      height: this.m_minimalSize.height - this.m_settings.strokeWidth,
      originX: this.m_settings.centered ? 'center' : 'left',
      originY: this.m_settings.centered ? 'center' : 'top',
      scaleY: -1,
      strokeUniform: true,

      fill: this.m_settings.fillColor,
      stroke: this.m_settings.strokeColor,
      strokeWidth: this.m_settings.strokeWidth
    });

    if (this.m_object.isType('Ellipse')) {
      (this.m_object as fabric.Ellipse).rx = (this.m_minimalSize.width - this.m_settings.strokeWidth) / 2;
      (this.m_object as fabric.Ellipse).ry = (this.m_minimalSize.height - this.m_settings.strokeWidth) / 2;
    }

    this.m_canvas.add(this.m_object);
    this.m_canvas.renderAll();

    this.m_canvas.on('mouse:move', this.drag);
  }

  drag(event: fabric.TPointerEventInfo): void {
    if (!this.m_canvas || !this.m_object)
      return;

    let deltaX = Math.abs(event.scenePoint.x - this.m_startPosition.x);
    let deltaY = Math.abs(event.scenePoint.y - this.m_startPosition.y);

    if (this.m_settings.centered) {
      deltaX *= 2;
      deltaY *= 2;
    }

    let width = (deltaX < this.m_minimalSize.width ? this.m_minimalSize.width : deltaX) - this.m_settings.strokeWidth;
    let height = (deltaY < this.m_minimalSize.height ? this.m_minimalSize.height : deltaY) - this.m_settings.strokeWidth;

    if (this.m_ratio) {
      width = Math.max(width, height * this.m_ratio);
      height = width / this.m_ratio;
    }

    this.m_object.set({
      width: width,
      height: height,
    });

    if (this.m_object.isType('Ellipse')) {
      (this.m_object as fabric.Ellipse).rx = width / 2;
      (this.m_object as fabric.Ellipse).ry = height / 2;
    }

    if (!this.m_settings.centered) {
      this.m_object.left =
        event.scenePoint.x < this.m_startPosition.x ?
          this.m_startPosition.x - width - this.m_settings.strokeWidth :
          this.m_startPosition.x;

      this.m_object.top =
        event.scenePoint.y < this.m_startPosition.y ?
          this.m_startPosition.y - height - this.m_settings.strokeWidth :
          this.m_startPosition.y;
    }

    this.m_canvas.renderAll();
  }

  end(): void {
    this.m_canvas?.off('mouse:move', this.drag);
    this.m_object?.setCoords();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.m_object || !event.shiftKey)
      return;

    this.m_ratio = this.m_object.width / this.m_object.height;
  }

  onKeyUp(event: KeyboardEvent): void {
    if (!this.m_object || event.shiftKey)
      return;

    this.m_ratio = 0;
  }
}