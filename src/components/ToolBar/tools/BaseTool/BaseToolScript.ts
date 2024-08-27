import * as fabric from 'fabric';

export default abstract class BaseTool {
  protected canvas: fabric.Canvas;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  // Common method to initialize the tool
  public abstract initialize(): void;

  // Common method to destroy the tool (remove event listeners, etc.)
  public abstract destroy(): void;
/* 
  public abstract onMouseDown(event: fabric.TEvent): void;

  public abstract onMouseMove(event: fabric.TEvent): void;

  public abstract onMouseUp(event: fabric.TEvent): void; */

  public abstract onClick(event: fabric.TEvent): void;
}
