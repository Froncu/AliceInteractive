import * as fabric from "fabric";
import { BaseTool } from "./BaseTool";

export class SelectTool implements BaseTool {
    private m_canvas?: fabric.Canvas;

    onChosen(canvas: fabric.Canvas): void {
        this.m_canvas = canvas;

        this.m_canvas.selectionKey = "ctrlKey";

        this.m_canvas.selection = true;
        this.m_canvas.forEachObject((object) => {
            object.selectable = object.hasControls;
            object.evented = object.hasControls;
        })
    }

    onUnchosen(): void {
        if (!this.m_canvas)
            return;

        this.m_canvas.discardActiveObject();

        this.m_canvas.selection = false;
        this.m_canvas.forEachObject((object) => {
            object.selectable = false;
            object.evented = false;
        })

        this.m_canvas.renderAll();
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
}