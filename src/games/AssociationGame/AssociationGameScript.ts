import { defineComponent, ref, onMounted } from 'vue';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';
import ToolBar from '@/components/ToolBar/ToolBar.vue';
import { BaseTool } from '@/components/tools/BaseTool';
import { SelectTool } from '@/components/tools/SelectTool';
import { MoveTool } from '@/components/tools/MoveTool';
import { ShapeTool } from '@/components/tools/ShapeTool';
import { BrushTool } from '@/components/tools/BrushTool';
import { BackgroundTool } from '@/components/tools/BackgroundTool';
import { TextTool } from '@/components/tools/TextTool';
import { ImageTool } from '@/components/tools/ImageTool';
import { InfluenceZone } from '@/components/InfluenceZone';

export default defineComponent({
  name: 'AssociationGame',
  components: {
    WhiteBoard,
    ToolBar
  },
  setup() {
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();
    const tools: BaseTool[] = [
      new ShapeTool(),
      new BrushTool(),
      new TextTool(),
      new ImageTool(),
      new BackgroundTool(),
      new SelectTool(),
      new MoveTool()
    ];

    onMounted(() => {
      const zone = new InfluenceZone(
        200, // zoneSize
        'Test zone 1', // zoneName
        '#FFFAA3', // zoneColor
        'black', // borderColor
        1, // borderSize
        16, // fontSize
        'black', // textColor
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/...' // zoneImage
      );

      if (whiteBoard.value) {
        const canvas = whiteBoard.value.canvas();
        zone.placeOnCanvas(canvas, { x: whiteBoard.value.canvas().getWidth() / 4, y: whiteBoard.value.canvas().getHeight() / 3 });
        zone.placeOnCanvas(canvas, { x: whiteBoard.value.canvas().getWidth() / 2, y: whiteBoard.value.canvas().getHeight() * 0.66 });
        zone.placeOnCanvas(canvas, { x: whiteBoard.value.canvas().getWidth() * 0.75, y: whiteBoard.value.canvas().getHeight() / 3 });
      }


    });

    return {
      whiteBoard,
      tools
    };
  }
});
