import { defineAsyncComponent, Component, watch } from 'vue';
import * as fabric from 'fabric';
import { BaseTool, BaseToolSettings } from '@/components/tools/BaseTool';

export class EmojiToolSettings extends BaseToolSettings {
    query = '';
    chosenEmoji = '';  // Store the emoji URL here
}

export class EmojiTool extends BaseTool {
    name = 'Emoji tool';

    private m_settings = new EmojiToolSettings();
    private m_canvas?: fabric.Canvas;

    override onChosen(canvas: fabric.Canvas): void {
        this.m_canvas = canvas;

        this.place = this.place.bind(this);

        this.m_canvas = canvas;

        this.m_canvas.on('mouse:down', this.place);

        return;
    }

    override onUnchosen(): void {
        this.m_canvas?.off('mouse:down', this.place);
        this.m_settings.chosenEmoji = "";
        this.m_settings.query = "";
        return;
    }

    override menu(): Component | null {
        return defineAsyncComponent(() => import('@/components/toolMenus/EmojiToolMenu/EmojiToolMenu.vue'));
    }

    override settings(): EmojiToolSettings | null {
        return this.m_settings;
    }

    override changeSettings(settings: EmojiToolSettings) {
        this.m_settings = settings;
    }


    private place(event: fabric.TPointerEventInfo) {
        if (!this.m_canvas) return;
        console.log("hey")

        // Create a fabric image object from the emoji URL and add it to the canvas
        
        //fabric.loadSVGFromURL("image.svg",function(objects,options)
        
        /* const emojiElement = new Image;
        emojiElement. = fabric.loadSVGFromURL('https://openmoji.org/data/color/svg/1F5FD.svg'); //this.m_settings.chosenEmoji;

        emojiElement.onload = () => {
            const emoji = new fabric.FabricImage(emojiElement, {
                selectable: false,
                evented: false,
            });

            emoji.set({
                left: event.viewportPoint.x - emoji.width / 2,
                top: event.viewportPoint.y - emoji.height / 2,
            })
            this.m_canvas?.add(emoji);
            this.m_canvas?.renderAll;
        }; */
    }
}
