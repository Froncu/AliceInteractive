import { BaseTool } from "./BaseTool";

import { Canvas } from "fabric/*";
import * as fabric from "fabric";

export class ShapeTool implements BaseTool {
    onChosen(canvas: Canvas): void {
        console.log('Shape tool chosen');
    }
    onUnchosen(canvas: Canvas): void {
        console.log('Shape tool unchosen');
    }
    use(canvas: Canvas, position: { x: number, y: number }): void {
        console.log('Shape tool use', position);

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
}