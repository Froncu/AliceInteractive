import { defineComponent, ref, onMounted } from 'vue';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.vue';
import CardItem from '@/components/CardItem/CardItem.vue';
import BackGround from '@/components/Background/BackGround.vue';
import ChoiceTimer from '@/components/ChoiceTimer/ChoiceTimer.vue';
import { getStorage, ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { authentication } from '@/../firebaseConfig.js'; // Import authentication
import { sessionId } from '@/app';  // Assuming sessionId is accessible


interface Card {
  id: number;
  title: string;
  imagePath: string;
  description: string;
}

export default defineComponent({
  name: 'PairWiseComparison',
  emits: [
    'gameFinished'
  ],
  components: {
    LoadingScreen,
    CardItem,
    BackGround,
    ChoiceTimer
  },
  setup(_, { emit }) {
    const cards = ref<Card[]>([]);
    const sortedCards = ref<Card[]>([]);
    const currentPair = ref<Card[]>([]);
    const selectedCardId = ref<number | null>(null);
    const resolveSelection = ref<((id: number) => void) | null>(null);
    const gameFinished = ref<boolean>(false);
    const choiceTimer = ref<InstanceType<typeof ChoiceTimer> | null>();
    const useTimer = ref(true);
    let uploaded = false; // To prevent multiple uploads


    const storage = getStorage();
    const isLoading = ref(true);

    onMounted(async () => {
      if (choiceTimer.value) choiceTimer.value.start();
      
      try {
        const userUID = authentication.currentUser?.uid;
        const sessionIdValue = sessionId;
    
        if (!userUID || !sessionIdValue) {
          throw new Error("User not authenticated or sessionId is missing.");
        }
    
        // Check if result already exists
        const resultExists = await checkIfResultExists(userUID, sessionIdValue);
    
        if (resultExists) {
          console.log("Result exists for user, skipping the game.");
          finishedGameBefore();  // Automatically finish the game without uploading
        } else {
          console.log("Result does not exist, proceeding with the game.");
          await loadData();  // Load the game data
          isLoading.value = false;
          sortedCards.value = await quickSort(cards.value);  // Sort the cards
          finishGame();  // Finish the game and upload the results
        }
      } catch (error) {
        console.error('Error fetching file from Firebase Storage:', error);
      }
    });
    
    // Enhanced function to check if result JSON exists in Firebase Storage
    async function checkIfResultExists(userUID: string, sessionId: string): Promise<boolean> {
      const location = storageRef(storage, `${sessionId}/PairWiseGame/Results/${userUID}.json`);
    
      try {
        await getDownloadURL(location);  // Attempt to fetch the file URL
        console.log(`File found at: ${location.fullPath}`);  // Log URL if file exists
        return true;  // File exists
      } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
          console.log("File not found in Firebase Storage.");
          return false;  // File doesn't exist
        } else {
          console.error("Error checking for result file:", error);
          throw error;  // Other errors should be handled
        }
      }
    }
    
    async function loadData() {
      const parameters = new URLSearchParams(window.location.search);
      const assetsDirectory = `${parameters.get('sessionId')}/PairWiseGame/`;
      let fileRef = storageRef(storage, assetsDirectory + 'cards.json');
      const url = await getDownloadURL(fileRef);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Failed to fetch cards: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      cards.value = data.cardItems;
      cards.value.forEach(async (card) => {
        fileRef = storageRef(storage, assetsDirectory + card.imagePath);
        card.imagePath = await getDownloadURL(fileRef);
      });
    }

    function handleTimeUp() {
      if (!choiceTimer.value)
        return;

      handleCardSelection(currentPair.value[Math.floor(Math.random())].id);
    }

    async function quickSort(array: Card[]): Promise<Card[]> {
      if (array.length <= 1) return array;

      const pivot = array[0];
      const remainingCards = array.slice(1);

      const preferredGroup: Card[] = [];
      const nonPreferredGroup: Card[] = [];

      // Compare pivot against each remaining card
      for (const card of remainingCards) {
        currentPair.value = [pivot, card];

        const selectedCardIdValue = await getUserSelection(); // Wait for user selection

        if (selectedCardIdValue === pivot.id) {
          nonPreferredGroup.push(card);
        } else {
          preferredGroup.push(card);
        }
      }

      // Recursively apply quicksort to preferred and non-preferred groups
      return [
        ...(await quickSort(preferredGroup)),
        pivot,
        ...(await quickSort(nonPreferredGroup)),
      ];
    }

    function getUserSelection(): Promise<number> {
      return new Promise((resolve) => {
        selectedCardId.value = null; // Reset the selected card
        resolveSelection.value = resolve; // Store the resolve function to call when the user selects a card
      });
    }

    function handleCardSelection(cardId: number) {
      selectedCardId.value = cardId; // Mark the card as selected
      if (resolveSelection.value) {
        resolveSelection.value(cardId); // Resolve the promise with the selected card's ID
        resolveSelection.value = null; // Reset the resolve function for the next selection
      }

      if (choiceTimer.value)
        choiceTimer.value.reset(true);
    }

// New function to handle already finished games
function finishedGameBefore() {
  console.log("Game was finished before, no upload required.");
  gameFinished.value = true;  // Mark the game as finished
  useTimer.value = false;
  emit('gameFinished');  // Emit the 'gameFinished' event
}

    function finishGame() {
      gameFinished.value = true; // Set the game as finished, showing the download button and results
      useTimer.value = false;
      uploadResult();  // Call uploadResult when the game finishes
      emit('gameFinished');
    }

    async function uploadResult() {
      if (uploaded) return;  // Prevent multiple uploads

      const fileData = JSON.stringify(sortedCards.value, null, 2);
      const blob = new Blob([fileData], { type: 'application/json' });
      const location = storageRef(storage, `${sessionId}/PairWiseGame/Results/${authentication.currentUser?.uid}.json`);

      try {
        await uploadBytes(location, blob); // Upload the sorted cards as a JSON file to Firebase
        uploaded = true;
        console.log('Results uploaded successfully');
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    return {
      cards,
      sortedCards,
      currentPair,
      selectedCardId,
      gameFinished,
      choiceTimer,
      useTimer,
      isLoading,
      handleCardSelection,
      //downloadJSON, // Expose the download function to the template
      handleTimeUp
    };
  },
});