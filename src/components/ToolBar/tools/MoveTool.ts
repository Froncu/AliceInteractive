import { BaseTool } from "./BaseTool";
import { Canvas } from "fabric/*";

export class MoveTool implements BaseTool {
    onChosen(canvas: Canvas): void {
        console.log('Move tool chosen');
    }
    onUnchosen(canvas: Canvas): void {
        console.log('Move tool unchosen');
    }
    use(canvas: Canvas, position: { x: number, y: number }): void {
        console.log('Move tool use', position);
    }
}