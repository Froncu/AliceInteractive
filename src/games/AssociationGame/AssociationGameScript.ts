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
import { getDatabase, set, ref as dbRef, push, Query } from "firebase/database";
import { initializeApp } from 'firebase/app';
import * as fabric from 'fabric';

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
        zone1.placeOnCanvas(canvas, { x: canvas.getWidth() / 5, y: canvas.getHeight() / 3 });
        zone2.placeOnCanvas(canvas, { x: canvas.getWidth() / 1.8, y: canvas.getHeight() * 0.66 });
        zone3.placeOnCanvas(canvas, { x: canvas.getWidth() / 1.2, y: canvas.getHeight() / 4.2 });

        let selection: number[] = [];
        
        //const previousStates: Record<number, any> = {};

        canvas.on("object:added", () => writeObjectData(canvas, canvas.getObjects().length - 1, canvas.getObjects()[canvas.getObjects().length - 1]));

        //canvas.on("object:removed", () => deleteObjectData());
        
        canvas.on("object:modified", function () {
          const activeObjects = canvas.getActiveObjects();

          activeObjects.forEach((obj) => {
            console.log(obj.calcTransformMatrix());
            const objectId = canvas.getObjects().indexOf(obj);
            selection.push(objectId);
            if (objectId !== -1) {
              writeObjectData(canvas, objectId, obj);
            }
          });
        });

        canvas.on("selection:cleared", function () {
          selection.forEach((obj) => {
            writeObjectData(canvas, obj, canvas.getObjects()[obj]);
          })
          selection = [];
        });


        /* canvas.on("object:added", function(object){
          const targetObj = object.target;
          const objectId = canvas.getObjects().indexOf(targetObj);
          console.log(objectId);
        });

        canvas.on("object:removed", function(object){
          const targetObj = object.target;
          const objectId = canvas.getObjects().indexOf(targetObj);
          console.log(objectId);
        });

        canvas.on("object:modified", function(object){
          const targetObj = object.target;
          const objectId = canvas.getObjects().indexOf(targetObj);
          console.log(objectId);
        }); */
      }
    });


    const firebaseConfig = {
      apiKey: "AIzaSyCLeNx1MRsTzkalAsZhpTWkkOMPwoPO2mw",
      authDomain: "alicedownrabithole.firebaseapp.com",
      databaseURL: "https://alicedownrabithole-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "alicedownrabithole",
      storageBucket: "alicedownrabithole.appspot.com",
      messagingSenderId: "161855541756",
      appId: "1:161855541756:web:7f4c1cc68d6f15b0ab2279",
      measurementId: "G-VSJY5XVPKM"

    };

    const app = initializeApp(firebaseConfig);

    function writeObjectData(canvas: fabric.Canvas, objectId: number, object: fabric.FabricObject) {
      const db = getDatabase();
      const reference = dbRef(db, "canvasObjects/");
      const newRef = push(reference);

      const objectData = object.toObject();

      const sanitizedObject = JSON.parse(JSON.stringify(objectData));

      set(newRef, {
        Id: objectId,
        object: sanitizedObject, // Send the sanitized object
      }).catch((error) => {
        console.error("Error saving object to Firebase:", error);
      });
    };

    /* function updateObjectData(canvas: fabric.Canvas, objectId: number, object: fabric.FabricObject) {

    } */
    
    /* function deleteObjectData(canvas: fabric.Canvas, objectId: number, object: fabric.FabricObject) {
      const db = getDatabase();
      const reference = dbRef(db, "canvasObjects/");
      const newRef = push(reference);
      
      Query applesQuery = ref.child("firebase-test").orderByChild("title").equalTo("Apple");
      deleteObject
    } */

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
