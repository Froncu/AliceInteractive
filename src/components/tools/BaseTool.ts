import { Component } from "vue";
import { Canvas } from "fabric/*";

export abstract class BaseToolSettings {}

export interface BaseTool {
  onChosen(canvas: Canvas): void;
  onUnchosen(): void;
  menu(): Component | null;
  settings(): BaseToolSettings | null;
  changeSettings(newSettings: BaseToolSettings): void;
}