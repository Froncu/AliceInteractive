import * as fabric from "fabric";
import { BaseTool, BaseToolSettings } from "./BaseTool";
import { ref, defineAsyncComponent, watch } from "vue";

export class TextToolSettings extends BaseToolSettings {
  font = 'Century Gothic';
  fontSize = 32;
  fontStyle = ''
  color = '#000000';
}

export class TextTool extends BaseTool {
  name = 'Text tool';

  private m_canvas?: fabric.Canvas;
  private m_settings = ref(new TextToolSettings);
  private m_textbox?: fabric.Textbox;
  private m_startPosition = { x: 0, y: 0 };

  override onChosen(canvas: fabric.Canvas) {
    this.start = this.start.bind(this);
    this.drag = this.drag.bind(this);
    this.end = this.end.bind(this);
    this.onSelectionCreated = this.onSelectionCreated.bind(this);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);
    this.onSelectionCleared = this.onSelectionCleared.bind(this);

    watch(() => this.m_settings, () => {
      if (!this.m_textbox)
        return;

      this.m_textbox.fontFamily = this.m_settings.value.font;
      this.m_textbox.fontSize = this.m_settings.value.fontSize;
      this.m_textbox.fontStyle = this.m_settings.value.fontStyle;
      this.m_textbox.fill = this.m_settings.value.color;
      this.m_textbox.initDimensions();
      this.m_canvas?.renderAll();
    }, { deep: true });

    this.m_canvas = canvas;
    this.m_canvas.forEachObject((object) => {
      if (!object.isType('textbox'))
        return;

      object.selectable = true;
      object.evented = true;
      object.hoverCursor = 'text';
      (object as fabric.Textbox).editable = true;
    });

    this.m_canvas.on('mouse:down', this.start);
    this.m_canvas.on('mouse:up', this.end);
    this.m_canvas.on('selection:created', this.onSelectionCreated);
    this.m_canvas.on('selection:updated', this.onSelectionChanged);
    this.m_canvas.on('selection:cleared', this.onSelectionCleared);
  }

  override onUnchosen() {
    this.m_canvas?.discardActiveObject();
    this.m_canvas?.forEachObject((object) => {
      if (!object.isType('textbox'))
        return;

      object.selectable = false;
      object.evented = false;
      object.hoverCursor = 'default';
      (object as fabric.Textbox).editable = false;
    });

    this.m_canvas?.renderAll();

    this.m_canvas?.off('mouse:down', this.start)
    this.m_canvas?.off('mouse:up', this.end)
    this.m_canvas?.off('selection:created', this.onSelectionCreated);
    this.m_canvas?.off('selection:updated', this.onSelectionChanged);
    this.m_canvas?.off('selection:cleared', this.onSelectionCleared);
  }

  override menu() {
    return defineAsyncComponent(() => import('@/components/toolMenus/TextToolMenu/TextToolMenu.vue'));
  }

  override settings() {
    return this.m_settings.value
  }

  override changeSettings(settings: TextToolSettings) {
    this.m_settings.value = settings;
  }

  onSelectionCreated(event: { selected: fabric.FabricObject[] }) {
    this.m_textbox = event.selected[0] as fabric.Textbox;

    this.m_settings.value.font = this.m_textbox.fontFamily;
    this.m_settings.value.fontSize = this.m_textbox.fontSize;
    this.m_settings.value.fontStyle = this.m_textbox.fontStyle;
    if (this.m_textbox.fill)
      this.m_settings.value.color = this.m_textbox.fill.toString();
  }

  onSelectionChanged(event: { selected: fabric.FabricObject[] }) {
    if (this.m_textbox?.text.length === 0)
      this.m_canvas?.remove(this.m_textbox);

    this.onSelectionCreated(event);
  }

  onSelectionCleared(event: { deselected: fabric.FabricObject[] }) {
    this.onSelectionChanged({ selected: event.deselected });
    this.m_textbox = undefined;
  }

  start(event: fabric.TPointerEventInfo) {
    if (!this.m_canvas)
      return;

    if (event.target)
      return;

    this.m_textbox = new fabric.Textbox('', {
      evented: true,
      selectable: true,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,

      left: event.scenePoint.x,
      top: event.scenePoint.y,
      editable: true,
      hoverCursor: 'text',

      fontFamily: this.m_settings.value.font,
      fontSize: this.m_settings.value.fontSize,
      fontStyle: this.m_settings.value.fontStyle,
      fill: this.m_settings.value.color
    });

    this.m_canvas.add(this.m_textbox);

    this.m_startPosition = event.scenePoint;
    this.m_canvas.on('mouse:move', this.drag);

    this.m_canvas.setActiveObject(this.m_textbox);
  }

  drag(event: fabric.TPointerEventInfo) {
    const deltaX = Math.abs(this.m_startPosition.x - event.scenePoint.x);
    const deltaY = Math.abs(this.m_startPosition.y - event.scenePoint.y);

    this.m_textbox?.set({
      width: deltaX,
      height: deltaY
    });

    this.m_canvas?.renderAll();
  }

  end() {
    this.m_canvas?.off('mouse:move', this.drag);
  }
}
