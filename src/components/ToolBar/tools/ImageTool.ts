import { BaseTool } from "./BaseTool";
import * as fabric from "fabric/*"

export class ImageTool implements BaseTool {
  


    onChosen (canvas: fabric.Canvas): void{
        return;
    }

    onUnchosen (canvas: fabric.Canvas): void{
        return;
    }

    startUse (canvas: fabric.Canvas, position: { x: number, y: number }): void{
        return;
    }

    use (canvas: fabric.Canvas, position: { x: number, y: number }): void{
        return;
    }

    endUse (canvas: fabric.Canvas, position: { x: number, y: number }): void{
        return;
    }
}