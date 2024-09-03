import { BaseTool } from "./BaseTool";
import { Canvas } from "fabric/*";

export class SelectTool implements BaseTool {
    onChosen(canvas: Canvas): void {
        canvas.selection = true;
        canvas.selectionKey = "ctrlKey";
        canvas.forEachObject((object) => {
            object.selectable = true;
            object.evented = true;
            if(!object.hasControls){
                object.selectable = false;
                object.evented = false;
            }
        }
    )}

    onUnchosen(canvas: Canvas): void {
        canvas.discardActiveObject();
        canvas.renderAll();
        canvas.selection = false;
        canvas.forEachObject((object) => {
            object.selectable = false;
            object.evented = false;
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