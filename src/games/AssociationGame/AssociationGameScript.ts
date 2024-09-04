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
        placeInfluenceZone(whiteBoard.value.canvas().getWidth()/10, 'Test zone 1', {x:whiteBoard.value.canvas().getWidth()/4, y:whiteBoard.value.canvas().getHeight()/3}, '#FFFAA3', 'black', 1);

        placeInfluenceZone(whiteBoard.value.canvas().getWidth()/10, 'Test zone 2', {x:whiteBoard.value.canvas().getWidth()/2, y:whiteBoard.value.canvas().getHeight()* 0.66}, '', 'black', 3, 30, 'red', 'https://s3-eu-west-1.amazonaws.com/blog-ecotree/blog/0001/01/ad46dbb447cd0e9a6aeecd64cc2bd332b0cbcb79.jpeg');

        placeInfluenceZone(whiteBoard.value.canvas().getWidth()/10, 'Test zone 3', {x:whiteBoard.value.canvas().getWidth()* 0.75, y:whiteBoard.value.canvas().getHeight()/3}, '#A7C7E7', 'black', 6, 25, 'blue', 'https://s3-eu-west-1.amazonaws.com/blog-ecotree/blog/0001/01/ad46dbb447cd0e9a6aeecd64cc2bd332b0cbcb79.jpeg');
      }
      

    });

    const placeInfluenceZone = (
      zoneSize: number,
      zoneName = "",
      zonePos = { x: 0, y: 0 },
      zoneColor = 'white',
      borderColor = zoneColor,
      borderSize = 1,
      fontSize = 16,
      textColor = 'black',
      zoneImage = ''
    ) => {
      if (whiteBoard.value) {
        const canvas = whiteBoard.value.canvas();
    
        const radius = zoneSize;
        const circle = new fabric.Circle({
          radius: radius,
          fill: zoneColor,
          left: zonePos.x - radius,
          top: zonePos.y - radius,
          stroke: borderColor,
          strokeWidth: borderSize,
          selectable: false,
        });
    
        const text = new fabric.Textbox(zoneName, {
          fontSize: fontSize,
          fill: textColor,
          width: zoneSize,
          textAlign: 'center',
          fontFamily: 'century gothic',
          selectable: false,
        });
    
        text.set({
          left: circle.left + circle.width / 2 - text.width / 2,
          top: circle.top + circle.height / 2 - text.height / 2,
        });
    
        const circleWithText = new fabric.Group([circle, text], {
          selectable: false,
          hasBorders: false,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          evented: false,
        });
    
        // Check if image_base64 is provided
        if (zoneImage) {
          const imgElement = new Image();
          imgElement.src = zoneImage;
          
          imgElement.onload = () => {
            const custom_image = new fabric.FabricImage(imgElement, {
              selectable: false,
              evented: false,
              hasControls: false,
            });
    
            custom_image.scaleToHeight(zoneSize);
            custom_image.scaleToWidth(zoneSize);
            
            custom_image.set({
              top: zonePos.y - custom_image.getScaledHeight(),
              left: zonePos.x - custom_image.getScaledWidth()/2,
            });

            text.set({
              top: circle.top + circle.height / 2,
            })
    
            // Add the image to the canvas
            canvas.add(custom_image);
            canvas.renderAll();
          };
        }
    
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
  