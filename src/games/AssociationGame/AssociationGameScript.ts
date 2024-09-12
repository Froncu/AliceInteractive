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
import { EmojiTool } from '@/components/tools/EmojiTool';

export default defineComponent({
  name: 'AssociationGame',
  emits: [
    'gameFinished'
  ],
  components: {
    WhiteBoard,
    ToolBar
  },
  setup(_, { emit }) {
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();
    const tools: BaseTool[] = [
      new TransformTool(),
      new MoveTool(),
      new BrushTool(),
      new ShapeTool(),
      new TextTool(),
      new ImageTool(),
      new BackgroundTool(),
      new EmojiTool()
    ];

    onMounted(() => {
      const zone1 = new InfluenceZone(
        200, // zoneSize
        '', // zoneName
        '#ffffff', // zoneColor
        'black', // borderColor
        1, // borderSize
        16, // fontSize
        'black', // textColor
        'https://png.pngtree.com/png-vector/20220607/ourmid/pngtree-cartoon-germ-virus-infection-disease-png-image_4920053.png' // zoneImage
      );

      const zone2 = new InfluenceZone(
        256, // zoneSize
        'Schimmel', // zoneName
        '#ffffff', // zoneColor
        'black', // borderColor
        1, // borderSize
        16, // fontSize
        'black', // textColor
        'https://png.pngtree.com/png-vector/20220501/ourmid/pngtree-mold-icon-isolated-on-white-background-mildew-food-splash-vector-png-image_30206614.png' // zoneImage
      );

      const zone3 = new InfluenceZone(
        128, // zoneSize
        'Dit is een voorbeeld text', // zoneName
        '#ffffff', // zoneColor
        'black', // borderColor
        1, // borderSize
        16, // fontSize
        'black', // textColor
        '' // zoneImage
      );

      if (whiteBoard.value) {
        const canvas = whiteBoard.value.canvas();
        zone1.placeOnCanvas(canvas, { x: whiteBoard.value.canvas().getWidth() / 5, y: whiteBoard.value.canvas().getHeight() / 3 });
        zone2.placeOnCanvas(canvas, { x: whiteBoard.value.canvas().getWidth() / 1.8, y: whiteBoard.value.canvas().getHeight() * 0.66 });
        zone3.placeOnCanvas(canvas, { x: whiteBoard.value.canvas().getWidth() / 1.2, y: whiteBoard.value.canvas().getHeight() / 4.2 });
      }
    });

    function onFinish() {
      emit('gameFinished');
    }

    return {
      whiteBoard,
      tools,
      onFinish
    };
  }
});
