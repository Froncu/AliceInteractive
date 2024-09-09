  import * as fabric from "fabric";
  import { ref, defineAsyncComponent, watch } from "vue";
  import { BaseTool, BaseToolSettings } from "./BaseTool";

  export class ShapeToolSettings extends BaseToolSettings {
    shape = 'rect';
    fillColor = '#ff0000';
    strokeColor = '#000000';
    strokeWidth = 0;
    centered = false;
  }

  export class ShapeTool extends BaseTool {
    name = 'Shape tool';

    private m_canvas?: fabric.Canvas;
    private m_settings = ref(new ShapeToolSettings());
    private m_object?: fabric.FabricObject;
    private m_startPosition = { x: 0, y: 0 };
    private m_minimalSize = { width: 32, height: 32 };
    private m_ratio = 0;

    override onChosen(canvas: fabric.Canvas) {
      this.start = this.start.bind(this);
      this.drag = this.drag.bind(this);
      this.end = this.end.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);

      watch(() => this.m_settings, () => {
        if (!this.m_object)
          return;

        const position = { x: this.m_object.left, y: this.m_object.top };
        const size = { width: this.m_object.width, height: this.m_object.height };
        this.m_canvas?.remove(this.m_object);
        this.m_object = this.createObject(position, size, true);

        this.m_canvas?.add(this.m_object);
        this.m_canvas?.renderAll();
      }, { deep: true });

      this.m_canvas = canvas;

      this.m_canvas.forEachObject((object) => {
        if (!object.isType('rect') && !object.isType('ellipse') && !object.isType('triangle'))
          return;

        object.selectable = true;
        object.evented = true;
        object.hoverCursor = 'pointer';
      });

      this.m_canvas.on('mouse:down', this.start)
      this.m_canvas.on('mouse:up', this.end);

      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('keyup', this.onKeyUp)
    }

    override onUnchosen() {
      if (!this.m_canvas)
        return;

      this.m_canvas.forEachObject((object) => {
        if (!object.isType('rect') && !object.isType('ellipse') && !object.isType('triangle'))
          return;

        object.selectable = false;
        object.evented = false;
        object.hoverCursor = 'default';
      });

      this.m_ratio = 0;
      this.m_canvas.discardActiveObject();
      this.m_object = undefined;

      this.m_canvas.off('mouse:down', this.start)
      this.m_canvas.off('mouse:up', this.end);

      window.removeEventListener('keydown', this.onKeyDown)
      window.removeEventListener('keyup', this.onKeyUp)
    }

    override menu() {
      return defineAsyncComponent(() => import('@/components/toolMenus/ShapeToolMenu/ShapeToolMenu.vue'));
    }

    override settings() {
      return this.m_settings.value;
    }

    override changeSettings(settings: ShapeToolSettings) {
      this.m_settings.value = settings;
    }

    createObject(position: { x: number, y: number }, size: { width: number, height: number }, selectable: boolean) {
      let shapeType: typeof fabric.FabricObject;
      switch (this.m_settings.value.shape) {
        case 'rect':
          shapeType = fabric.Rect;
          break;

        case 'ellipse':
          shapeType = fabric.Ellipse;
          break;

        case 'triangle':
          shapeType = fabric.Triangle;
          break;

        default:
          throw Error('shape not mapped!');
      }

      const object = new shapeType({
        evented: selectable,
        selectable: selectable,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,

        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        originX: this.m_settings.value.centered ? 'center' : 'left',
        originY: this.m_settings.value.centered ? 'center' : 'top',
        scaleY: -1,
        strokeUniform: true,
        hoverCursor: 'pointer',

        fill: this.m_settings.value.fillColor,
        stroke: this.m_settings.value.strokeColor,
        strokeWidth: this.m_settings.value.strokeWidth
      });

      if (object.isType('Ellipse')) {
        (object as fabric.Ellipse).rx = size.width / 2;
        (object as fabric.Ellipse).ry = size.height / 2;
      }

      return object;
    }

    start(event: fabric.TPointerEventInfo) {
      if (!this.m_canvas)
        return;

      if (event.target) {
        this.m_object = event.target;

        this.m_settings.value.shape = this.m_object.type;
        this.m_settings.value.fillColor = (this.m_object.fill as string);
        this.m_settings.value.strokeColor = (this.m_object.stroke as string);
        this.m_settings.value.strokeWidth = this.m_object.strokeWidth;
        this.m_settings.value.centered = this.m_object.originX == 'center';
      }
      else {
        this.m_startPosition = event.scenePoint;
        this.m_object = this.createObject(event.scenePoint, this.m_minimalSize, false);
        this.m_canvas.add(this.m_object);
        this.m_canvas.on('mouse:move', this.drag);
      }

      this.m_canvas.setActiveObject(this.m_object);
      this.m_canvas.renderAll();
    }

    drag(event: fabric.TPointerEventInfo) {
      if (!this.m_canvas || !this.m_object)
        return;

      let deltaX = Math.abs(event.scenePoint.x - this.m_startPosition.x);
      let deltaY = Math.abs(event.scenePoint.y - this.m_startPosition.y);

      if (this.m_settings.value.centered) {
        deltaX *= 2;
        deltaY *= 2;
      }

      let width = (deltaX < this.m_minimalSize.width ? this.m_minimalSize.width : deltaX) - this.m_settings.value.strokeWidth;
      let height = (deltaY < this.m_minimalSize.height ? this.m_minimalSize.height : deltaY) - this.m_settings.value.strokeWidth;

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

      if (!this.m_settings.value.centered) {
        this.m_object.left =
          event.scenePoint.x < this.m_startPosition.x ?
            this.m_startPosition.x - width - this.m_settings.value.strokeWidth :
            this.m_startPosition.x;

        this.m_object.top =
          event.scenePoint.y < this.m_startPosition.y ?
            this.m_startPosition.y - height - this.m_settings.value.strokeWidth :
            this.m_startPosition.y;
      }

      this.m_canvas.renderAll();
    }

    end() {
      this.m_canvas?.off('mouse:move', this.drag);

      if (!this.m_object)
        return;

      this.m_object.evented = true;
      this.m_object.selectable = true;
      this.m_object.setCoords();
    }

    onKeyDown(event: KeyboardEvent) {
      if (!this.m_object || !event.shiftKey)
        return;

      this.m_ratio = this.m_object.width / this.m_object.height;
    }

    onKeyUp(event: KeyboardEvent) {
      if (!this.m_object || event.shiftKey)
        return;

      this.m_ratio = 0;
    }
  }