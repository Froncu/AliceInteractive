import { defineComponent, ref, onMounted } from 'vue';
import * as fabric from 'fabric';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';
import ToolBar from '@/components/ToolBar/ToolBar.vue';
import { BaseTool } from '@/components/ToolBar/tools/BaseTool';
import { SelectTool } from '@/components/ToolBar/tools/SelectTool';
import { MoveTool } from '@/components/ToolBar/tools/MoveTool';
import { ShapeTool } from '@/components/ToolBar/tools/ShapeTool';
import { BrushTool } from '@/components/ToolBar/tools/BrushTool';
import { BackgroundTool } from '@/components/ToolBar/tools/BackgroundTool';
import { TextTool } from '@/components/ToolBar/tools/TextTool';
import { ImageTool } from '@/components/ToolBar/tools/ImageTool';

export default defineComponent({
  name: 'AssociationGame',
  components: {
    WhiteBoard,
    ToolBar
  },
  setup() {
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();
    const toolBar = ref<InstanceType<typeof ToolBar>>();

    const toolbarTools: BaseTool[] = [
      new SelectTool(),
      new MoveTool(),
      new ShapeTool(),
      new BrushTool(),
      new BackgroundTool(),
      new TextTool(),
      new ImageTool()
    ];

    onMounted(() => {
      if (toolBar.value && whiteBoard.value) {
        toolBar.value.setTargetWhiteBoard(whiteBoard.value);
      }

      if (whiteBoard.value){
        placeInfluenceZone(200, 'Test zone', whiteBoard.value.canvas().getCenterPoint(), '', 'black', 2);
      }
      

    });

    const placeInfluenceZone = (zoneSize: number,  zoneName = "", zonePos = {x: 0, y: 0}, zoneColor = 'white', borderColor = zoneColor, borderSize = 1) => {
      if (whiteBoard.value) {
        const canvas = whiteBoard.value.canvas(); // Assuming WhiteBoard has a getCanvas method to get the Fabric canvas instance

        // Example Influence Zone: Circle with Text
        const radius = zoneSize;
        const circle = new fabric.Circle({
          radius: radius,
          fill: zoneColor,
          left: zonePos.x - radius,
          top: zonePos.y - radius,
          stroke: borderColor,
          strokeWidth: borderSize,
          selectable: false
        });

        const text = new fabric.Textbox(zoneName, {
          fontSize: 16,
          fill: '#333',
          width: 100,
          textAlign: 'center',
          selectable: false // Make the text non-selectable
        });

        // Center the text inside the circle
        text.set({
          left: circle.left + (circle.width || 0) / 2 - text.width / 2,
          top: circle.top + (circle.height || 0) / 2 - text.height / 2,
        });

        const circleWithText = new fabric.Group([circle, text], {
          selectable: false,
          hasBorders: false,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          evented: false,
        });

        // Example Influence Zone: Circle with Image
        /* fabric.FabricImage.fromURL(zoneImage, image => {
          image.scaleToWidth(50);
          image.scaleToHeight(50);
          image.set({
            selectable: false
          });

          canvas.add(image);

          const imageCircle = new fabric.Circle({
            radius: radius,
            fill: '#ff6348',
            left: 200,
            top: 200,
            selectable: false // Make the circle non-selectable
          });

          // Center the image inside the circle
          image.set({
            left: imageCircle.left + (imageCircle.width || 0) / 2 - image.width! / 2,
            top: imageCircle.top + (imageCircle.height || 0) / 2 - image.height! / 2,
          });

          const circleWithImage = new fabric.Group([imageCircle, image], {
            selectable: false // Make the group non-selectable
          });

          // Add the influence zone with image to the canvas
          canvas.add(circleWithImage);
        }); */

        // Add the influence zone with text to the canvas
        canvas.add(circleWithText);

        // Render the canvas to display the added influence zones
        canvas.renderAll();
      }
    };

    return {
      whiteBoard,
      toolBar,
      toolbarTools,
      placeInfluenceZone
    };
  }
});
  