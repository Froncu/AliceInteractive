import * as fabric from "fabric";
import { BaseTool } from "./BaseTool";

export class TransformTool extends BaseTool {
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
}