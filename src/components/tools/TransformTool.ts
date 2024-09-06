import * as fabric from "fabric";
import { BaseTool, BaseToolSettings } from "./BaseTool";
import { ref, defineAsyncComponent } from "vue";

export class TransformToolSettings extends BaseToolSettings {
  delete = false;
  selectAll = false;
}

export class TransformTool extends BaseTool {
  private m_settings = ref(new TransformToolSettings);
  private m_canvas?: fabric.Canvas;

  override onChosen(canvas: fabric.Canvas) {
    this.m_canvas = canvas;

    this.m_canvas.selectionKey = "ctrlKey";
    this.m_canvas.selection = true;

    this.m_canvas.forEachObject((object) => {
      if (!object.isType(`group`)) {
        object.selectable = true;
        object.evented = true;
        object.hasControls = true;
        object.lockMovementX = false;
        object.lockMovementY = false;
        object.hoverCursor = 'move';
      }
    })
  }

  override onUnchosen() {
    if (!this.m_canvas)
      return;

    this.m_canvas.discardActiveObject();
    this.m_canvas.selection = false;

    this.m_canvas.forEachObject((object) => {
      object.selectable = false;
      object.evented = false;
      object.hasControls = false;
      object.lockMovementX = true;
      object.lockMovementY = true;
      object.hoverCursor = 'default';
    })

    this.m_canvas.renderAll();
  }

  override menu() {
    return defineAsyncComponent(() => import('@/components/toolMenus/TransformToolMenu/TransformToolMenu.vue'));
  }

  override settings() {
    return this.m_settings.value;
  }

  override changeSettings(settings: TransformToolSettings) {
    this.m_settings.value = settings;
      
    function selectAllNonGroupObjects(canvas: fabric.Canvas) {
      const nonGroupObjects = canvas.getObjects().filter(object => object.type !== 'group');
  
      if (nonGroupObjects.length) {
        const selection = new fabric.ActiveSelection(nonGroupObjects, {
          canvas: canvas
        });
  
        canvas.setActiveObject(selection);
        canvas.renderAll();  // Redraw the canvas
      }
    }
  
    if (this.m_canvas){
      selectAllNonGroupObjects(this.m_canvas);
    }

    if (this.m_settings.value.delete) {
      this.m_canvas?.getActiveObjects().forEach((object) => {
        this.m_canvas?.remove(object);
      });

      this.m_canvas?.discardActiveObject();
      this.m_settings.value.delete = false;
      this.m_canvas?.renderAll();
    }
  }
}