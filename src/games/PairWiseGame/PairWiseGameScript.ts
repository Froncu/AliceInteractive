import { defineComponent, ref, onMounted } from 'vue';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.vue';
import CardItem from '@/components/CardItem/CardItem.vue';
import BackGround from '@/components/Background/BackGround.vue';
import ChoiceTimer from '@/components/ChoiceTimer/ChoiceTimer.vue';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

interface Card {
  id: number;
  title: string;
  imagePath: string;
  description: string;
}

export default defineComponent({
  name: 'PairWiseComparison',
  components: {
    LoadingScreen,
    CardItem,
    BackGround,
    ChoiceTimer
  },
  setup() {
    const cards = ref<Card[]>([]);
    const sortedCards = ref<Card[]>([]);
    const currentPair = ref<Card[]>([]);
    const selectedCardId = ref<number | null>(null);
    const resolveSelection = ref<((id: number) => void) | null>(null);
    const gameFinished = ref<boolean>(false);
    const choiceTimer = ref<InstanceType<typeof ChoiceTimer> | null>();
    const useTimer = ref(true);

    const storage = getStorage();
    const isLoading = ref(true);

    onMounted(async () => {
      if (choiceTimer.value) choiceTimer.value.start();

      try {
        await loadData();
        isLoading.value = false;

        sortedCards.value = await quickSort(cards.value);
        finishGame();

      } catch (error) {
        console.error('Error fetching file from Firebase Storage:', error);
      }
    });

    async function loadData() {
      const assetsDirectory = 'Test01/PairWiseGame/';
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

    function finishGame() {
      gameFinished.value = true; // Set the game as finished, showing the download button and results
      useTimer.value = false;
    }

    function downloadJSON() {
      const dataStr = JSON.stringify(sortedCards.value, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sorted-cards.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
      downloadJSON, // Expose the download function to the template
      handleTimeUp
    };
  },
});