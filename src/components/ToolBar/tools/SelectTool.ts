import { BaseTool } from "./BaseTool";
import { Canvas } from "fabric/*";

export class SelectTool implements BaseTool {
    onChosen(canvas: Canvas): void {
        canvas.selection = true;
        canvas.forEachObject((object) => {
            object.selectable = true;
        })
    }

    onUnchosen(canvas: Canvas): void {
        canvas.discardActiveObject();
        canvas.renderAll();
        canvas.selection = false;
        canvas.forEachObject((object) => {
            object.selectable = false;
        })
    }

    startUse(): void {
        return;
    }

    use(): void {
        return;
    }

    endUse(): void {
        return;
    }
}