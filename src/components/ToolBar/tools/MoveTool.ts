import { BaseTool } from "./BaseTool";
import * as fabric from "fabric";

export class MoveTool implements BaseTool {
    private grabPosition = { x: 0, y: 0 };
    private maxZoom = 4;  // Maximum zoom level
    private minZoom = 1;  // Minimum zoom level
    private handleMouseWheelBound?: (opt: fabric.TEvent) => void;

    onChosen(canvas: fabric.Canvas): void {
        // Bind the mouse wheel event listener for zooming
        this.handleMouseWheelBound = (opt) => this.handleMouseWheel(opt, canvas);
        canvas.on('mouse:wheel', this.handleMouseWheelBound);
    }

    onUnchosen(canvas: fabric.Canvas): void {
        // Remove the mouse wheel event listener using the bound reference
        if (this.handleMouseWheelBound) {
            canvas.off('mouse:wheel', this.handleMouseWheelBound);
        }
    }

    startUse(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        this.grabPosition = position;
    }

    use(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        const zoomLevel = canvas.getZoom();

        if (zoomLevel > 1) {
            const deltaX = position.x - this.grabPosition.x;
            const deltaY = position.y - this.grabPosition.y;

            const transform = canvas.viewportTransform!;
            transform[4] += deltaX;
            transform[5] += deltaY;

            // Apply boundaries to prevent panning beyond the original canvas size
            this.applyBoundaries(canvas, transform, zoomLevel);

            this.grabPosition = position;

            canvas.renderAll();
        }
    }

    endUse(): void {
        return;
    }

    private handleMouseWheel(opt: fabric.TEvent, canvas: fabric.Canvas): void {
        const evt = opt.e as WheelEvent;
        let zoomLevel = canvas.getZoom();
        const delta = evt.deltaY;

        // Adjust zoom level based on scroll direction
        zoomLevel = zoomLevel - delta / 800;
        zoomLevel = Math.min(this.maxZoom, Math.max(this.minZoom, zoomLevel));

        const pointer = canvas.getViewportPoint(evt);
        const zoomPoint = new fabric.Point(pointer.x, pointer.y);

        // Zoom in or out centered on the mouse pointer
        canvas.zoomToPoint(zoomPoint, zoomLevel);

        evt.preventDefault();
        evt.stopPropagation();

        // Restrict panning if zoom level is 1 or below
        const transform = canvas.viewportTransform!;
        if (zoomLevel <= 1) {
            transform[4] = 0;
            transform[5] = 0;
        } else {
            // Apply boundaries to prevent panning beyond the original canvas size
            this.applyBoundaries(canvas, transform, zoomLevel);
        }

        canvas.renderAll();
    }

    private applyBoundaries(canvas: fabric.Canvas, transform: number[], zoomLevel: number): void {
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        // Calculate the bounds for panning
        const maxPanX = (canvasWidth * zoomLevel - canvasWidth);
        const maxPanY = (canvasHeight * zoomLevel - canvasHeight);

        // Restrict panning left and right
        if (transform[4] > 0) {
            transform[4] = 0; // Prevent panning left beyond the canvas
        } else if (transform[4] < -maxPanX) {
            transform[4] = -maxPanX; // Prevent panning right beyond the canvas
        }

        // Restrict panning up and down
        if (transform[5] > 0) {
            transform[5] = 0; // Prevent panning up beyond the canvas
        } else if (transform[5] < -maxPanY) {
            transform[5] = -maxPanY; // Prevent panning down beyond the canvas
        }
    }
}
