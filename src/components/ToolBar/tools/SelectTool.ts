import { BaseTool } from "./BaseTool";
import { Canvas } from "fabric/*";

export class SelectTool implements BaseTool {
    onChosen(canvas: Canvas): void {
        console.log('Select tool chosen');

        canvas.selection = true;
        canvas.forEachObject((object) => {
            object.selectable = true;
        })
    }
    onUnchosen(canvas: Canvas): void {
        console.log('Select tool unchosen');

        canvas.discardActiveObject();
        canvas.renderAll();
        canvas.selection = false;
        canvas.forEachObject((object) => {
            object.selectable = false;
        })
    }
    use(canvas: Canvas, position: { x: number, y: number }): void {
        console.log('Select tool use', position);
    }
}