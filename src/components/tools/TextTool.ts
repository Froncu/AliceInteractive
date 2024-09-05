import * as fabric from "fabric";
import { BaseTool, BaseToolSettings } from "./BaseTool";
import { Component, defineAsyncComponent } from "vue";

export class TextToolSettings implements BaseToolSettings{
    font = 'Century Gothic';
    fontSize = 32;
    color = '000000'
}

export class TextTool implements BaseTool {
    private m_settings = new TextToolSettings;
    private m_canvas?: fabric.Canvas;
    private m_startPosition = { x: 0, y: 0 };
    private m_textbox?: fabric.Textbox;

    onChosen(canvas: fabric.Canvas): void {
        this.place = this.place.bind(this);

        this.m_canvas = canvas;
        this.m_canvas.on('mouse:down', this.place)
    }

    onUnchosen(): void {
        this.m_canvas?.off('mouse:down', this.place)
    }

    menu(): Component {
        return defineAsyncComponent(() => import('@/components/toolMenus/TextToolMenu/TextToolMenu.vue'));
    }

    settings(): TextToolSettings {
        return this.m_settings;
    }

    changeSettings(settings: TextToolSettings): void {
        this.m_settings = settings;
    }

    place(event: fabric.TPointerEventInfo): void {
        if (!this.m_canvas)
            return;

        this.m_startPosition = event.scenePoint;

        this.m_textbox = new fabric.Textbox(
            'Text',
            {
                left: this.m_startPosition.x,
                top: this.m_startPosition.y,
                originX: 'center',
                originY: 'center',
                editable: true,
                selectable: false,

                fontFamily: this.m_settings.font,
                fontSize: this.m_settings.fontSize,
                fill: this.m_settings.color
            }
        );

        this.m_canvas.add(this.m_textbox);
        this.m_canvas.renderAll();
    }
}
