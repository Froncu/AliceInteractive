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
import { authentication } from '@/../firebaseConfig.js'; // Import authentication
import { sessionId } from '@/app';  // Assuming sessionId is available here
import { uploadResult } from '@/Utils/UploadToFirebase';

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
      const userUID = authentication.currentUser?.uid;
      const sessionIdValue = sessionId;

      if (!userUID || !sessionIdValue) {
        console.error("User not authenticated or sessionId is missing.");
        return;
      }

      // Check if the result already exists in Firebase Storage
      const resultExists = await checkIfResultExists(userUID, sessionIdValue);

      if (resultExists) {
        console.log("Result exists for user, skipping the game.");
        finishedGameBefore();  // Call function to finish the game immediately
      } else {
        console.log("Result does not exist, proceeding with the game.");
        // Proceed with normal game flow if no result exists
        await loadInfluenceZones();  // Load Influence Zones and proceed
      }
    });

    // Function to check if the result JSON exists in Firebase Storage
    async function checkIfResultExists(userUID: string, sessionId: string): Promise<boolean> {
      const filePath = `${sessionId}/AssociationGame/Results/${userUID}.json`;
      const fileRef = storageRef(getStorage(), filePath);

      try {
        const fileURL = await getDownloadURL(fileRef);  // Try to get the URL for the result file
        const response = await fetch(fileURL);
        const canvasJSON = await response.json();

        console.log(`Canvas JSON found at: ${filePath}`);

        // Load the canvas from the JSON
        if (whiteBoard.value) {
          const canvas = whiteBoard.value.canvas();
          canvas.loadFromJSON(canvasJSON, canvas.renderAll.bind(canvas));  // Load and render the canvas
          console.log("Canvas successfully loaded from JSON.");
        }
        return true;  // File exists and canvas was successfully loaded
      } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
          console.log("Result file not found, game has not been finished.");
          return false;  // File does not exist, game not completed
        } else {
          console.error("Error checking result file:", error);
          throw error;
        }
      }
    }

    // Function to mark the game as finished without uploading any result
    function finishedGameBefore() {
      console.log("Game was finished before, no upload required.");
      emit('gameFinished');  // Emit the 'gameFinished' event to signal completion
    }

    // Function to load Influence Zones and proceed with the game
    async function loadInfluenceZones() {
      try {
        const InfluenceZoneData: InfluenceZoneData[] = await loadFromFirebase('AssociationGame', 'influenceZones');
            
        // Fetch images for each Influence Zone from Firebase Storage
        for (const zone of InfluenceZoneData) {
          const imagePath = `${sessionId}/AssociationGame/${zone.image}`;  // Firebase path to the image
          const imageRef = storageRef(getStorage(), imagePath);
          try {
            zone.image = await getDownloadURL(imageRef);  // Update the image field with the Firebase URL
            console.log(`Image loaded for zone: ${zone.name}, URL: ${zone.image}`);
          } catch (error) {
            console.error(`Failed to load image for zone: ${zone.name}`, error);
          }
        }

        if (whiteBoard.value) {
          const canvas = whiteBoard.value.canvas();
    
          // Place zones on the canvas using grid layout logic (like in the original code)
          placeInfluenceZonesOnCanvas(canvas, InfluenceZoneData);
        }
      } catch (error) {
        console.error("Error loading InfluenceZones:", error);
      }
    }

    // Function to place Influence Zones on the canvas using a grid layout
    function placeInfluenceZonesOnCanvas(canvas: any, InfluenceZoneData: InfluenceZoneData[]) {
      const isUpdatingFromFirebase = false;

      // Get canvas dimensions
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // Maximum columns allowed for the grid system (up to 4 columns)
      const maxColumns = 4;

      // Determine the number of zones
      const zoneCount = InfluenceZoneData.length;

      // Calculate the optimal number of rows and columns based on the zone count
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

      // Determine the width and height of each grid cell
      const gridCellWidth = canvasWidth / columns;
      const gridCellHeight = canvasHeight / rows;

      // Calculate the optimal zone size, taking minor spacing into account
      const minorSpacingRatio = 0.05; // 5% spacing between zones
      const availableGridCellSize = Math.min(gridCellWidth, gridCellHeight);
      const zoneSideLength = availableGridCellSize * (1 - minorSpacingRatio); // Size the zone with minor spacing

      // Distribute zones across rows to balance them optimally
      const zonesPerRow: number[] = [];
      let remainingZones = zoneCount;

      for (let i = 0; i < rows; i++) {
        const zonesInCurrentRow = Math.min(remainingZones, columns);
        zonesPerRow.push(zonesInCurrentRow);
        remainingZones -= zonesInCurrentRow;
      }

      // Place the zones on the canvas
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

    // Function to save the canvas as JSON when the game finishes
    function onFinish() {
      if (whiteBoard.value) {
        const canvas = whiteBoard.value.canvas();

        // Convert the canvas to a JSON string
        const canvasJSON = canvas.toJSON();

        // Upload the canvas JSON to Firebase under the appropriate path
        uploadCanvasResultToFirebase(canvasJSON);
        
        emit('gameFinished');
      }
    }

    // Upload the canvas result to Firebase
    async function uploadCanvasResultToFirebase(canvasJSON: any) {
      const userUID = authentication.currentUser?.uid;
      const sessionIdValue = sessionId;

      if (!userUID || !sessionIdValue) {
        console.error("User not authenticated or sessionId is missing.");
        return;
      }

      try {
        // Define the file path
        const filePath = `${sessionIdValue}/AssociationGame/Results/${userUID}.json`;
        const jsonBlob = new Blob([JSON.stringify(canvasJSON)], { type: 'application/json' });

        // Upload the JSON to Firebase Storage
        const storage = getStorage();
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, jsonBlob);
        
        console.log("Canvas JSON successfully uploaded:", filePath);
      } catch (error) {
        console.error("Error uploading canvas JSON to Firebase:", error);
      }
    }

    return {
      whiteBoard,
      tools,
      onFinish
    };
  }
});
