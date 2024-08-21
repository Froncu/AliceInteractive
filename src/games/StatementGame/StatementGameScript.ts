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
    const cardData = ref<{ 
      imagePath: string; 
      textContent: string; 
      leftPlaceholderImage: string; 
      leftPlaceholderText: string; 
      rightPlaceholderImage: string; 
      rightPlaceholderText: string; 
    }[]>([]);
    const currentIndex = ref<number>(0);
    const imagePath = ref<string | undefined>(undefined);
    const textContent = ref<string>('Loading...');
    const leftPlaceholderImage = ref<string | undefined>(undefined);
    const leftPlaceholderText = ref<string | undefined>(undefined);
    const rightPlaceholderImage = ref<string | undefined>(undefined);
    const rightPlaceholderText = ref<string | undefined>(undefined);

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
        const currentCard = cardData.value[currentIndex.value];
        imagePath.value = currentCard.imagePath;
        textContent.value = currentCard.textContent;
        leftPlaceholderImage.value = currentCard.leftPlaceholderImage;
        leftPlaceholderText.value = currentCard.leftPlaceholderText;
        rightPlaceholderImage.value = currentCard.rightPlaceholderImage;
        rightPlaceholderText.value = currentCard.rightPlaceholderText;
        currentIndex.value++;
      } else {
        textContent.value = 'No more cards!';
      }
    };

    const handleCardDropped = () => {
      loadNextCard();
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
      leftPlaceholderImage,
      leftPlaceholderText,
      rightPlaceholderImage,
      rightPlaceholderText,
      handleCardDropped
    };
  }
});