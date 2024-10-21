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
import { set, ref as dbRef, remove, onValue } from "firebase/database";
import { database } from '@/../firebaseConfig.js';
import * as fabric from 'fabric';
import { v4 as uuid } from 'uuid';
import { loadFromFirebase } from '@/Utils/LoadFromFirebase';


interface InfluenceZoneData {
  size: number;
  name: string;
  color: string;
  bordercolor: string;
  bordersize: number;
  fontsize: number;
  fontcolor: string;
  image: string;
}

export default defineComponent({
  name: 'AssociationGame',
  emits: ['gameFinished'],
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

    // Define an async function inside the onMounted hook
    onMounted(async () => {
      try {
        // Fetch InfluenceZone data from Firebase (ensure it matches the type)
        const InfluenceZoneData: InfluenceZoneData[] = await loadFromFirebase('AssociationGame', 'influenceZones');
    
        if (whiteBoard.value) {
          const canvas = whiteBoard.value.canvas();
          const isUpdatingFromFirebase = false;
    
          // Correctly type the totalZoneSize
          const totalZoneSize = InfluenceZoneData.reduce((total: number, zone: InfluenceZoneData) => total + zone.size, 0);
    
          // Get canvas dimensions
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          const canvasArea = canvasWidth * canvasHeight;
    
          InfluenceZoneData.forEach((zoneData, index) => {
            // Scale the size based on the canvas size
            const zoneSizeRatio = zoneData.size / totalZoneSize;
            const zoneArea = canvasArea * zoneSizeRatio;
            const zoneSideLength = Math.sqrt(zoneArea); // Assume square zones
    
            // Create InfluenceZone object
            const zone = new InfluenceZone(
              zoneSideLength/3, // scaled zone size
              zoneData.name,
              zoneData.color,
              zoneData.bordercolor,
              zoneData.bordersize,
              zoneData.fontsize,
              zoneData.fontcolor,
              zoneData.image
            );
    
            // Calculate positions based on grid or other layout logic
            console.log(zoneSideLength )
            const x = zoneSideLength*index + (zoneSideLength/3) // Example grid logic: 3 zones per row
            const y = Math.floor(index / 3) * (canvasHeight / 3);  // Move to the next row after 3 zones
            // Place the zone on canvas
            console.log(x, y)
            zone.placeOnCanvas(canvas, { x, y });
          });
    
          // Canvas events
          canvas.on('object:added', (target) => {
            if (!isUpdatingFromFirebase) {
              const object = target.target;
              object.set({ ID: uuid() });
              writeObject(object);
            }
          });
    
          canvas.on('object:modified', (target) => {
            if (!isUpdatingFromFirebase) {
              const object = target.target;
              writeObject(object);
            }
          });
    
          canvas.on('object:removed', (target) => {
            if (!isUpdatingFromFirebase) {
              const object = target.target;
              deleteObject(object);
            }
          });
    
          const updateRef = dbRef(database, 'canvasObjects/update/');
        }
      } catch (error) {
        console.error("Error loading InfluenceZone data:", error);
      }
    });

    function writeObject(object: fabric.FabricObject) {
      const ID = object.get('ID') as string;

      set(dbRef(database, `canvasObjects/update/${ID}`), {
        object: JSON.parse(JSON.stringify(object))
      }).catch((error) => {
        console.error("Error saving object to Firebase:", error);
      });
    }

    function deleteObject(object: fabric.FabricObject) {
      const ID = object.get('ID') as number;
      remove(dbRef(database, `canvasObjects/${ID}`));
    }

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
