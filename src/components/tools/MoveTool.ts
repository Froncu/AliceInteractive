import * as fabric from "fabric";
import { BaseTool } from "./BaseTool";

export class MoveTool extends BaseTool {
  name = 'Verplaats';

  private m_canvas?: fabric.Canvas;
  private grabPosition = { x: 0, y: 0 };
  private maxZoom = 4;
  private minZoom = 1;

  override onChosen(canvas: fabric.Canvas) {
    this.grab = this.grab.bind(this);
    this.drag = this.drag.bind(this);
    this.release = this.release.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);

    this.m_canvas = canvas;
    this.m_canvas.on('mouse:down', this.grab);
    this.m_canvas.on('mouse:up', this.release);
    this.m_canvas.on('mouse:wheel', this.onMouseWheel);
  }

  override onUnchosen() {
    this.m_canvas?.off('mouse:down', this.grab);
    this.m_canvas?.off('mouse:up', this.release);
    this.m_canvas?.off('mouse:wheel', this.onMouseWheel);
  }

  grab(event: fabric.TPointerEventInfo) {
    this.grabPosition = event.viewportPoint;
    this.m_canvas?.on('mouse:move', this.drag);
  }

  drag(event: fabric.TPointerEventInfo) {
    if (!this.m_canvas)
      return;

    const deltaX = event.viewportPoint.x - this.grabPosition.x;
    const deltaY = event.viewportPoint.y - this.grabPosition.y;

    this.m_canvas.viewportTransform[4] += deltaX;
    this.m_canvas.viewportTransform[5] += deltaY;

    this.applyBoundaries();

    this.grabPosition = event.viewportPoint;

    this.m_canvas.renderAll();
  }

  release() {
    this.m_canvas?.off('mouse:move', this.drag);
  }

  onMouseWheel(event: fabric.TPointerEventInfo) {
    if (!this.m_canvas)
      return;

    let zoomLevel = this.m_canvas.getZoom();
    const wheelEvent = event.e as WheelEvent;
    zoomLevel -= wheelEvent.deltaY / 500;
    zoomLevel = Math.min(this.maxZoom, Math.max(this.minZoom, zoomLevel));

    this.m_canvas.zoomToPoint(this.m_canvas.getViewportPoint(wheelEvent), zoomLevel);

    this.applyBoundaries();

    this.m_canvas.renderAll();
  }

  applyBoundaries() {
    if (!this.m_canvas)
      return;

    const canvasWidth = this.m_canvas.getWidth();
    const canvasHeight = this.m_canvas.getHeight();

    const transform = this.m_canvas.viewportTransform;

    const maxPanX = (canvasWidth * this.m_canvas.getZoom() - canvasWidth);
    if (transform[4] > 0)
      transform[4] = 0;
    else if (transform[4] < -maxPanX)
      transform[4] = -maxPanX;

    const maxPanY = (canvasHeight * this.m_canvas.getZoom() - canvasHeight);
    if (transform[5] > 0)
      transform[5] = 0;
    else if (transform[5] < -maxPanY)
      transform[5] = -maxPanY;
  }
}
