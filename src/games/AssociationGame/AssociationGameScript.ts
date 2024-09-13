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
        const isUpdatingFromFirebase = false;

        zone1.placeOnCanvas(canvas, { x: canvas.getWidth() / 5, y: canvas.getHeight() / 3 });
        zone2.placeOnCanvas(canvas, { x: canvas.getWidth() / 1.8, y: canvas.getHeight() * 0.66 });
        zone3.placeOnCanvas(canvas, { x: canvas.getWidth() / 1.2, y: canvas.getHeight() / 4.2 });

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

        /* onValue(updateRef, (snapshot) => {
          isUpdatingFromFirebase = true; // Prevent canvas event triggering

          snapshot.forEach(childSnapshot => {
            const objectData:fabric.FabricObject = childSnapshot.val().object;

            // fabric.util.enlivenObjects requires an array of object definitions
            fabric.util.enlivenObjects((objectData:fabric.FabricObject) => {
              const obj = objects[0]; // Get the first (and only) object
              if (obj) {
                canvas.add(obj); // Add the object to the canvas
                obj.set({ ID: uuid() }); // Ensure the object has an ID
                canvas.renderAll(); // Render the canvas after adding the object
              }
            }); // Add a null options argument to match EnlivenObjectOptions
          });

          isUpdatingFromFirebase = false; // Re-enable event handling
        }); */


      }
    });

    function writeObject(object: fabric.FabricObject) {
      const ID = object.get('ID') as string;

      // Only update the object if it's been modified.
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
