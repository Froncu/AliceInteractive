import { defineComponent, ref, onMounted } from 'vue';
import DilemmaCard from '@/components/DilemmaCard/DilemmaCard.vue';
import PlaceHolder from '@/components/PlaceHolder/PlaceHolder.vue';

export default defineComponent({
  name: 'StatementGame',
  components: {
    DilemmaCard,
    PlaceHolder
  },
  setup() {
    const cardData = ref<{ imagePath: string; textContent: string }[]>([]);
    const currentIndex = ref<number>(0);
    const imagePath = ref<string | undefined>(undefined);
    const textContent = ref<string>('Loading...');

    const fetchData = async () => {
      try {
        const response = await fetch('/assets/cardData.json');
        const data = await response.json();
        cardData.value = data;
        loadNextCard();
      } catch (error) {
        console.error('Error fetching data:', error);
        textContent.value = 'Error loading data.';
      }
    };

    const loadNextCard = () => {
      if (currentIndex.value < cardData.value.length) {
        imagePath.value = cardData.value[currentIndex.value].imagePath;
        textContent.value = cardData.value[currentIndex.value].textContent;
        currentIndex.value++;
      } else {
        textContent.value = 'No more cards!';
      }
    };

    const handleCardDropped = () => {
      // Reload the next card
      loadNextCard();

      // Reset the card position to the center of the screen
      const cardElement = document.querySelector('.dilemma-card') as HTMLElement;
      if (cardElement) {
        cardElement.style.left = '50%';
        cardElement.style.top = '50%';
        cardElement.style.transform = 'translate(-50%, -50%)';
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      imagePath,
      textContent,
      handleCardDropped
    };
  }
});
