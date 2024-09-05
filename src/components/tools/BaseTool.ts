import { Component } from "vue";
import { Canvas } from "fabric/*";

export abstract class BaseToolSettings { }

export abstract class BaseTool {
  abstract onChosen(canvas: Canvas): void;
  abstract onUnchosen(): void;

  menu(): Component | null {
    return null;
  }

  settings(): BaseToolSettings | null {
    return null;
  }

  changeSettings(settings: BaseToolSettings) {
    return;
  }
}