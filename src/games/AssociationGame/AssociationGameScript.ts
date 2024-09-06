import { defineComponent, ref, onMounted } from 'vue';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';
import ToolBar from '@/components/ToolBar/ToolBar.vue';
import { BaseTool } from '@/components/tools/BaseTool';
import { TransformTool } from '@/components/tools/TransformTool';
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
      new TransformTool(),
      new MoveTool(),
      new BrushTool(),
      new ShapeTool(),
      new TextTool(),
      new ImageTool(),
      new BackgroundTool(),
    ];

    onMounted(() => {
      const zone = new InfluenceZone(
        64, // zoneSize
        'Wist je dat ganzen heel graag bananen eten?', // zoneName
        '#FFFAA3', // zoneColor
        'black', // borderColor
        1, // borderSize
        16, // fontSize
        'black', // textColor
        'https://kaifolog.ru/uploads/posts/2016-04/1460115572_069.jpg' // zoneImage
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
