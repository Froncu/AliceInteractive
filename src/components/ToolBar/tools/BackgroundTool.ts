import { BaseTool } from "./BaseTool";
import * as fabric from "fabric";

export class BackgroundTool implements BaseTool{
    
    private m_rValue?: string;
    private m_gValue?: string;
    private m_bValue?: string;
    private m_backgroundColor?: string; 
    
    onChosen(canvas: fabric.Canvas): void {
        return;
    }

    onUnchosen(canvas: fabric.Canvas): void{
        return;
    }

    startUse(canvas: fabric.Canvas, position: { x: number; y: number; }): void{
        
        this.m_backgroundColor = "rgb(" + (Math.random() * 255).toString() + ", " + (Math.random() * 255).toString() + ", " + (Math.random() * 255).toString() + ")";

        canvas.backgroundColor = this.m_backgroundColor;
        canvas.renderAll();
      }

    use(canvas: fabric.Canvas, position: { x: number, y: number }): void{
        return;
    }

    endUse(canvas: fabric.Canvas, position: { x: number; y: number; }): void{
        return;
      }
}