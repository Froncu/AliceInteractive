import { BaseTool } from "./BaseTool";
import * as fabric from "fabric";

export class ShapeTool implements BaseTool {

    private m_startPos?: { x: number, y: number };
    private m_shapeWidth = 0;
    private m_shapeHeight = 0;
    private m_rect?: fabric.Rect; // Store the rectangle object

    onChosen(): void {
        return;
    }

    onUnchosen(): void {
        return;
    }

    startUse(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        this.m_startPos = position;

        // Create the rectangle at the starting position
        this.m_rect = new fabric.Rect({
            left: position.x,
            top: position.y,
            fill: 'red',
            width: 0, // Initially set to 0, as it will be resized
            height: 0, // Initially set to 0, as it will be resized
            selectable: false
        });

        canvas.add(this.m_rect);
    }

    use(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        if (this.m_startPos && this.m_rect) {
            // Calculate the new width and height based on the current mouse position
            this.m_shapeWidth = Math.abs(position.x - this.m_startPos.x);
            this.m_shapeHeight = Math.abs(position.y - this.m_startPos.y);

            // Adjust the rectangle's position and size
            this.m_rect.set({
                width: this.m_shapeWidth,
                height: this.m_shapeHeight
            });

            if (position.x < this.m_startPos.x) {
                this.m_rect.set({ left: position.x });
            }
            if (position.y < this.m_startPos.y) {
                this.m_rect.set({ top: position.y });
            }

            // Render the canvas to apply changes
            canvas.renderAll();
        }
    }

    endUse(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        if (this.m_rect) {
            // Ensure minimum size of 15x15 for the rectangle
            if (this.m_shapeWidth < 15 && this.m_shapeHeight < 15 ) {
                this.m_shapeWidth = 15;
                this.m_shapeHeight = 15;
                this.m_rect.set({
                    left: this.m_startPos!.x - this.m_shapeWidth / 2,
                    top: this.m_startPos!.y - this.m_shapeHeight / 2
                });
            }
            
            this.m_rect.set({
                width: this.m_shapeWidth,
                height: this.m_shapeHeight
            });

            this.m_rect.setCoords();

            // Make sure to re-render the canvas with the final size
            canvas.renderAll();
        }
    }
}