import { BaseTool } from "./BaseTool";
import * as fabric from "fabric";

export class TextTool implements BaseTool {
    private m_startPos?: { x: number, y: number };
    private m_boxWidth = 0;
    private m_boxHeight = 0;
    private m_textBox?: fabric.Textbox;

    onChosen(canvas: fabric.Canvas): void {
        return;
    }

    onUnchosen(canvas: fabric.Canvas): void {
        return;
    }

    startUse(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        this.m_startPos = position;

        // Create the textbox at the starting position with initial size 0
        this.m_textBox = new fabric.Textbox(
            "The Industrial Revolution and its consequences have been a disaster for the human race.",
            {
                left: position.x,
                top: position.y,
                fontFamily: "Century Gothic",
                fontSize: 20,
                width: 0, // Initially set to 0, as it will be resized
                height: 0, // Initially set to 0, as it will be resized
                editable: true,
                selectable: false, // Prevent the textbox from being moved
                originX: 'left',
                originY: 'top'
            }
        );

        canvas.add(this.m_textBox);
    }

    use(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        if (this.m_startPos && this.m_textBox) {
            // Calculate the new width and height based on the current mouse position
            this.m_boxWidth = Math.abs(position.x - this.m_startPos.x);
            this.m_boxHeight = Math.abs(position.y - this.m_startPos.y);

            // Ensure the textbox grows from the start position
            this.m_textBox.set({
                width: this.m_boxWidth,  // Ensure at least 20x20 size
                height: this.m_boxHeight, // Ensure at least 20x20 size
            });

            // Render the canvas to apply changes
            canvas.renderAll();
        }
    }

    endUse(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        if (this.m_textBox) {

            // Apply the final size to the textbox
            this.m_textBox.set({
                width: this.m_boxWidth,
                height: this.m_boxHeight,
                selectable: false, // Ensure the textbox remains non-selectable
            });

            // Make sure to re-render the canvas with the final size
            canvas.renderAll();
        }
    }
}
