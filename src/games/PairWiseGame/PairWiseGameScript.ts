import { defineComponent, ref, onMounted } from 'vue';
import CardItem from '@/components/CardItem/CardItem.vue';
import BackGround from '@/components/Background/BackGround.vue';

interface Card {
  id: number;
  title: string;
  imagePath: string;
  description: string;
}

export default defineComponent({
  name: 'PairWiseComparison',
  components: {
    CardItem,
    BackGround,
  },
  setup() {
    const cards = ref<Card[]>([]);
    const sortedCards = ref<Card[]>([]);
    const currentPair = ref<Card[]>([]);
    const selectedCardId = ref<number | null>(null);
    const resolveSelection = ref<((id: number) => void) | null>(null);
    const gameFinished = ref<boolean>(false);

    onMounted(async () => {
      const response = await fetch('/assets/PairWiseGame/cards.json'); // Ensure the path is correct
      if (!response.ok) {
        console.error(`Failed to fetch cards: ${response.statusText}`);
        return;
      }
      const data = await response.json();
      cards.value = data.cardItems;
      sortedCards.value = await quickSort(cards.value); // Start the quicksort
      finishGame();
    });

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
    }

    function finishGame() {
      gameFinished.value = true; // Set the game as finished, showing the download button and results
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
      handleCardSelection,
      downloadJSON, // Expose the download function to the template
    };
  },
});