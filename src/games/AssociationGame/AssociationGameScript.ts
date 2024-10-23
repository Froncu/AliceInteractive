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
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
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
        await getDownloadURL(fileRef);  // Try to get the URL for the result file
        console.log(`Result file found at: ${filePath}`);
        return true;  // File exists, game was already completed
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
            
        // Fetch 1s for each Influence Zone from Firebase Storage
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
            // For 1 to 3 zones, use only 1 row, and columns match the zone count
            columns = zoneCount;
            rows = 1;
          } else if (zoneCount <= 4) {
            // For 4 zones, use a 2x2 grid (2 rows, 2 columns)
            columns = 2;
            rows = Math.ceil(zoneCount / columns);
          } else if (zoneCount <= 6) {
            // For 5 to 6 zones, use a 3-column layout (3 columns, 2 rows)
            columns = 3;
            rows = Math.ceil(zoneCount / columns);
          } else if (zoneCount <= 8) {
            // For 7 to 8 zones, use a 4-column layout (4 columns, 2 rows)
            columns = 4;
            rows = Math.ceil(zoneCount / columns);
          } else {
            // For more than 8 zones, cap columns at 4 and calculate rows
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
    
          // Calculate how to distribute zones across rows
          const zonesPerRow = [];  // Use 'const' here as recommended
          let remainingZones = zoneCount;
    
          // Distribute zones across rows to balance them optimally
          for (let i = 0; i < rows; i++) {
            const zonesInCurrentRow = Math.min(remainingZones, columns);
            zonesPerRow.push(zonesInCurrentRow);
            remainingZones -= zonesInCurrentRow;
          }
    
          // Iterate through each zone and place them based on the row/column logic
          let zoneIndex = 0;
          zonesPerRow.forEach((zonesInRow, rowIndex) => {
            for (let colIndex = 0; colIndex < zonesInRow; colIndex++) {
              const zoneData = InfluenceZoneData[zoneIndex];
    
              // Create InfluenceZone object with scaled size
              const zone = new InfluenceZone(
                zoneSideLength/2,        // scaled zone size based on grid cell size
                zoneData.name,
                zoneData.color,
                zoneData.bordercolor,
                zoneData.bordersize,
                zoneData.fontsize,
                zoneData.fontcolor,
                zoneData.image
              );
    
              // Calculate the center position of each grid cell
              const x = (colIndex + 0.5) * gridCellWidth;   // Centered within the column
              const y = (rowIndex + 0.5) * gridCellHeight;  // Centered within the row
    
              // Log positions for debugging
              console.log(`Zone ${zoneIndex} - X: ${x}, Y: ${y}, Size: ${zoneSideLength}`);
    
              // Place the zone on canvas at the calculated X and Y positions
              zone.placeOnCanvas(canvas, { x, y });
    
              // Increment the zone index for the next iteration
              zoneIndex++;
            }
          });
        }
      } catch (error) {
        console.error("Error loading InfluenceZones:", error);
      }
    }

    // Existing functions (e.g., writeObject, deleteObject) remain unchanged
    function onFinish() {
      uploadResult('AssociationGame',{finished:true}) // Upload result when the game finishes
      emit('gameFinished');
    }

    return {
      whiteBoard,
      tools,
      onFinish
    };
  }
});
