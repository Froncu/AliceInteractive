import * as fabric from 'fabric';
import { BaseTool, BaseToolSettings } from '@/components/tools/BaseTool';
import { ref, defineAsyncComponent } from 'vue';
import { getStorage, ref as storageRef, getDownloadURL, StorageReference } from 'firebase/storage';

export class EmojiToolSettings extends BaseToolSettings {
  query = "";
  chosenEmoji = ""; // This will store the selected emoji character like "😀"
  emojis: Record<string, any> = {}; // This will store the emoji data from the JSON file
}

export class EmojiTool extends BaseTool {
  name = 'Emoji tool';

  private m_fileRef?: StorageReference;
  private m_settings = new EmojiToolSettings();
  private m_canvas?: fabric.Canvas;

  private m_storage = getStorage();

  constructor() {
    super();

    if (Object.keys(this.m_settings.emojis).length === 0)
      this.loadEmojis();
  }

  override onChosen(canvas: fabric.Canvas) {
    this.m_canvas = canvas;

    // Bind placeEmoji method to the class instance
    this.placeEmoji = this.placeEmoji.bind(this);
    this.m_canvas.on('mouse:down', this.placeEmoji);
  }

  override onUnchosen(): void {
    this.m_canvas?.off('mouse:down', this.placeEmoji);
    this.m_settings.chosenEmoji = "";
    this.m_settings.query = "";
  }

  override menu() {
    return defineAsyncComponent(() => import('@/components/toolMenus/EmojiToolMenu/EmojiToolMenu.vue'));
  }

  override settings(): EmojiToolSettings {
    return this.m_settings;
  }

  override changeSettings(settings: EmojiToolSettings) {
    this.m_settings = settings;
  }

  private async loadEmojis(): Promise<void> {
    const assetsDirectory = 'Test01/AssociationGame/';
    this.m_fileRef = storageRef(this.m_storage, assetsDirectory + 'emojis.json');
    const url = await getDownloadURL(this.m_fileRef);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch emojis: ${response.statusText}`);
      return;
    }

    const emojiData = await response.json();
    this.m_settings.emojis = emojiData.emojis;
  }

  private placeEmoji(event: fabric.TPointerEventInfo) {
    if (!this.m_settings.chosenEmoji) {
      console.error('No emoji selected.');
      return;
    }

    // Create a fabric.Text object for the selected emoji
    const emojiText = new fabric.Textbox(this.m_settings.chosenEmoji, {
      selectable: false,
      evented: false,
      editable: false,
    });

    const groupArr: fabric.FabricObject[] = [emojiText];

    const emojiGroup = new fabric.Group(groupArr, {
      selectable: false,
    })

    emojiGroup.set({
      left: event.viewportPoint.x - emojiGroup.width / 2,
      top: event.viewportPoint.y - emojiGroup.height / 2,
    })

    this.m_canvas?.add(emojiGroup);
    this.m_canvas?.renderAll();
  }
}
