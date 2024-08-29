import { BaseTool } from "./BaseTool";

import * as fabric from "fabric/*";

export class MoveTool implements BaseTool {
    onChosen(): void {
        return;
    }

    onUnchosen(): void {
        return;
    }
    
    startUse(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        this.grabPosition = position;
    }
    
    use(canvas: fabric.Canvas, position: { x: number, y: number }): void {
        canvas.viewportTransform[4] += position.x - this.grabPosition.x;
        canvas.viewportTransform[5] += position.y - this.grabPosition.y;

        canvas.renderAll();
    }
    
    endUse(): void {
        return;
    }

    private grabPosition = {x: 0, y: 0};
}