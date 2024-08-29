import { BaseTool } from "./BaseTool";

import * as fabric from "fabric";

export class ShapeTool implements BaseTool {
    onChosen(): void {
        return;
    }

    onUnchosen(): void {
        return;
    }

    startUse(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        const rect = new fabric.Rect({
            left: position.x - 50,
            top: position.y - 50,
            fill: 'red',
            width: 100,
            height: 100,
            selectable: false
        });

        canvas.add(rect);
    }

    use(): void {
        return
    }

    endUse(): void {
        return;
    }
}