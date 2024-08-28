import BaseTool from '../BaseTool/BaseTool.vue';
import * as fabric from 'fabric';

export default class ShapeTool extends BaseTool {
  private shape: fabric.Object | null = null;

  onMouseDown(event: fabric.IEvent): void {
    this.shape = new fabric.Rect({
      left: event.pointer.x,
      top: event.pointer.y,
      width: 0,
      height: 0,
      fill: 'red'
    });
    this.canvas.add(this.shape);
  }

  onMouseMove(event: fabric.IEvent): void {
    if (!this.shape) return;

    const pointer = this.canvas.getViewportPoint(event.e);
    this.shape.set({
      width: Math.abs(pointer.x - (this.shape.left || 0)),
      height: Math.abs(pointer.y - (this.shape.top || 0))
    });
    this.canvas.renderAll();
  }

  onMouseUp(event: fabric.IEvent): void {
    this.shape = null;
  }
}


