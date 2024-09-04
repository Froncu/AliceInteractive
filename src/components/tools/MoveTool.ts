import * as fabric from "fabric";
import { BaseTool } from "./BaseTool";

export class MoveTool implements BaseTool {
    private m_canvas?: fabric.Canvas;
    private grabPosition = { x: 0, y: 0 };
    private maxZoom = 4;
    private minZoom = 1;

    onChosen(canvas: fabric.Canvas): void {
        this.grab = this.grab.bind(this);
        this.drag = this.drag.bind(this);
        this.release = this.release.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);

        this.m_canvas = canvas;
        this.m_canvas.on('mouse:down', this.grab);
        this.m_canvas.on('mouse:up', this.release);
        this.m_canvas.on('mouse:wheel', this.onMouseWheel);
    }

    onUnchosen(): void {
        this.m_canvas?.off('mouse:down', this.grab);
        this.m_canvas?.off('mouse:up', this.release);
        this.m_canvas?.off('mouse:wheel', this.onMouseWheel);
    }

    menu(): null {
        return null;
    }

    settings(): null {
        return null;
    }

    changeSettings(): void {
        return;
    }

    grab(event: fabric.TPointerEventInfo): void {
        this.grabPosition = event.viewportPoint;
        this.m_canvas?.on('mouse:move', this.drag);
    }

    drag(event: fabric.TPointerEventInfo): void {
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

    release(): void {
        this.m_canvas?.off('mouse:move', this.drag);
    }

    onMouseWheel(event: fabric.TPointerEventInfo): void {
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

    applyBoundaries(): void {
        if (!this.m_canvas)
            return;

        const canvasWidth = this.m_canvas.getWidth();
        const canvasHeight = this.m_canvas.getHeight();

        const maxPanX = (canvasWidth * this.m_canvas.getZoom() - canvasWidth);
        const maxPanY = (canvasHeight * this.m_canvas.getZoom() - canvasHeight);
        const transform = this.m_canvas.viewportTransform;

        if (transform[4] > 0)
            transform[4] = 0;
        else if (transform[4] < -maxPanX)
            transform[4] = -maxPanX;

        if (transform[5] > 0)
            transform[5] = 0;
        else if (transform[5] < -maxPanY)
            transform[5] = -maxPanY;
    }
}