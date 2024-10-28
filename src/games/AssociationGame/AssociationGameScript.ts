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
import { v4 as uuid } from 'uuid';
import { loadFromFirebase } from '@/Utils/LoadFromFirebase';
import { getStorage, ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { authentication } from '@/../firebaseConfig.js';
import { sessionId } from '@/app';
import { uploadResult } from '@/Utils/UploadToFirebase';
import testLoadData from '../testLoadData.json';

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

    onMounted(async () => {
       // Delay interaction with whiteBoard until it's initialized
       if (!whiteBoard.value) {
        console.error("WhiteBoard component is not initialized.");
        return;
      }
      
      // Confirm whiteBoard is ready to use
      console.log("WhiteBoard component initialized:", whiteBoard.value);
      const userUID = authentication.currentUser?.uid;
      const sessionIdValue = sessionId;

      if (!userUID || !sessionIdValue) {
        console.error("User not authenticated or sessionId is missing.");
        return;
      }

      const resultExists = await checkIfResultExists(userUID, sessionIdValue);

      if (resultExists) {
        console.log("Result exists for user, skipping the game.");
        finishedGameBefore();
      } else {
        console.log("Result does not exist, proceeding with the game.");
        await loadInfluenceZones();
      }
    });

    async function checkIfResultExists(userUID: string, sessionId: string): Promise<boolean> {
      const filePath = `${sessionId}/AssociationGame/Results/${userUID}.json`;
      const fileRef = storageRef(getStorage(), filePath);

      try {
        const fileURL = await getDownloadURL(fileRef);
        const response = await fetch(fileURL);
        const canvasJSON = await response.json();

        console.log(`Canvas JSON found at: ${filePath}`);

        if (whiteBoard.value) {
          const canvas = whiteBoard.value.canvas();

          // Ensure each image in the JSON is cross-origin
          canvasJSON.objects.forEach((obj: any) => {
            if (obj.type === 'image') {
              obj.crossOrigin = 'anonymous';
            }
          });

          canvas.loadFromJSON(canvasJSON, canvas.renderAll.bind(canvas));
          console.log("Canvas successfully loaded from JSON.");
        }
        return true;
      } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
          console.log("Result file not found, game has not been finished.");
          return false;
        } else {
          console.error("Error checking result file:", error);
          throw error;
        }
      }
    }

    function finishedGameBefore() {
      console.log("Game was finished before, no upload required.");
      emit('gameFinished');
    }

    async function loadInfluenceZones() {
      try {
        const InfluenceZoneData: InfluenceZoneData[] = await loadFromFirebase('AssociationGame', 'influenceZones');

        for (const zone of InfluenceZoneData) {
          const imagePath = `${sessionId}/AssociationGame/${zone.image}`;
          const imageRef = storageRef(getStorage(), imagePath);
          try {
            const imageUrl = await getDownloadURL(imageRef);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;

            // Wait for image to load
            await new Promise((resolve) => {
              img.onload = () => {
                zone.image = img.src;
                resolve(true);
              };
            });
            console.log(`Image loaded for zone: ${zone.name}, URL: ${zone.image}`);
          } catch (error) {
            console.error(`Failed to load image for zone: ${zone.name}`, error);
          }
        }

        if (whiteBoard.value) {
          const canvas = whiteBoard.value.canvas();
          placeInfluenceZonesOnCanvas(canvas, InfluenceZoneData);
        }
      } catch (error) {
        console.error("Error loading InfluenceZones:", error);
      }
    }

    function placeInfluenceZonesOnCanvas(canvas: any, InfluenceZoneData: InfluenceZoneData[]) {
      const isUpdatingFromFirebase = false;

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const maxColumns = 4;
      const zoneCount = InfluenceZoneData.length;

      let columns = 0;
      let rows = 0;

      if (zoneCount <= 3) {
        columns = zoneCount;
        rows = 1;
      } else if (zoneCount <= 4) {
        columns = 2;
        rows = Math.ceil(zoneCount / columns);
      } else if (zoneCount <= 6) {
        columns = 3;
        rows = Math.ceil(zoneCount / columns);
      } else if (zoneCount <= 8) {
        columns = 4;
        rows = Math.ceil(zoneCount / columns);
      } else {
        columns = maxColumns;
        rows = Math.ceil(zoneCount / columns);
      }

      const gridCellWidth = canvasWidth / columns;
      const gridCellHeight = canvasHeight / rows;
      const minorSpacingRatio = 0.05;
      const availableGridCellSize = Math.min(gridCellWidth, gridCellHeight);
      const zoneSideLength = availableGridCellSize * (1 - minorSpacingRatio);

      const zonesPerRow: number[] = [];
      let remainingZones = zoneCount;

      for (let i = 0; i < rows; i++) {
        const zonesInCurrentRow = Math.min(remainingZones, columns);
        zonesPerRow.push(zonesInCurrentRow);
        remainingZones -= zonesInCurrentRow;
      }

      let zoneIndex = 0;
      zonesPerRow.forEach((zonesInRow, rowIndex) => {
        for (let colIndex = 0; colIndex < zonesInRow; colIndex++) {
          const zoneData = InfluenceZoneData[zoneIndex];

          const zone = new InfluenceZone(
            zoneSideLength / 2,
            zoneData.name,
            zoneData.color,
            zoneData.bordercolor,
            zoneData.bordersize,
            zoneData.fontsize,
            zoneData.fontcolor,
            zoneData.image
          );

          const x = (colIndex + 0.5) * gridCellWidth;
          const y = (rowIndex + 0.5) * gridCellHeight;

          console.log(`Zone ${zoneIndex} - X: ${x}, Y: ${y}, Size: ${zoneSideLength}`);

          zone.placeOnCanvas(canvas, { x, y });

          zoneIndex++;
        }
      });
    }

    function onFinish() {
      if (whiteBoard.value) {
        const canvas = whiteBoard.value.canvas();
        const canvasJSON = canvas.toJSON();
        uploadCanvasResultToFirebase(canvasJSON);
        emit('gameFinished');
      }
    }

    function onLoadData() {
      if (whiteBoard.value) {
        const canvas = whiteBoard.value.canvas();

        canvas.loadFromJSON(testLoadData, () => {
          // Ensure each image has crossOrigin set to 'anonymous' after loading from JSON
          canvas.getObjects().forEach((obj, index) => {
            if (obj.type === 'image') {
              obj.set({ crossOrigin: 'anonymous' });
            }

            // Additional logic to make specific objects non-selectable and non-evented
            if (index === 0 || index === 1 || index === 2) {
              obj.selectable = false;
              obj.evented = false;
            }
          });

          // Render the canvas to apply the changes
          setTimeout(() => {
            canvas.renderAll();
          }, 50);

          console.log("Canvas successfully loaded from testLoadData.json.");
        });
      }
    }


    function onDownloadImage() {
      if (whiteBoard.value) {
        const canvas = whiteBoard.value.canvas();
        const dataURL = canvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 });
        const link = document.createElement('a');
        link.href = dataURL;
        setTimeout(() => {
          link.download = 'whiteboard.png';
          link.click();
        }, 50);
      }
    }


    async function uploadCanvasResultToFirebase(canvasJSON: any) {
      const userUID = authentication.currentUser?.uid;
      const sessionIdValue = sessionId;

      if (!userUID || !sessionIdValue || !whiteBoard.value) {
        console.error("User not authenticated, sessionId missing, or WhiteBoard component not found.");
        return;
      }

      try {
        // Upload JSON file to Firebase
        const jsonFilePath = `${sessionIdValue}/AssociationGame/Results/${userUID}.json`;
        const jsonBlob = new Blob([JSON.stringify(canvasJSON)], { type: 'application/json' });
        const storage = getStorage();
        /* const jsonFileRef = storageRef(storage, jsonFilePath);
        await uploadBytes(jsonFileRef, jsonBlob); */

        console.log("Canvas JSON successfully uploaded:", jsonFilePath);

        // Generate image from canvas and upload
        const canvas = whiteBoard.value.canvas();
        const dataURL = canvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 });
        const imageBlob = await (await fetch(dataURL)).blob(); // Convert dataURL to blob
        const imageFilePath = `${sessionIdValue}/AssociationGame/Images/${userUID}.png`;
        const imageFileRef = storageRef(storage, imageFilePath);
        await uploadBytes(imageFileRef, imageBlob);

        console.log("Canvas image successfully uploaded:", imageFilePath);
      } catch (error) {
        console.error("Error uploading canvas result to Firebase:", error);
      }
    }

    return {
      whiteBoard,
      tools,
      onFinish,
      onLoadData,
      onDownloadImage
    };
  }
});
