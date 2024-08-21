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

    const answers = ref<{ 
      cardImage: string | undefined; 
      cardText: string; 
      placeholderImage: string | undefined; 
      placeholderText: string; 
    }[]>([]);

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
        saveAnswersToFile();
      }
    };

    const handleCardDropped = (placeholder: { image: string | undefined, text: string }) => {
      if (imagePath.value !== undefined) {
        answers.value.push({
          cardImage: imagePath.value,
          cardText: textContent.value,
          placeholderImage: placeholder.image,
          placeholderText: placeholder.text
        });
      }
      loadNextCard();
    };

    const saveAnswersToFile = () => {
      const fileData = JSON.stringify(answers.value, null, 2);
      const blob = new Blob([fileData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'answers.json';
      a.click();
      URL.revokeObjectURL(url);
    };

    onMounted(() => {
      fetchData();
      const placeholders = document.querySelectorAll('.place-holder') as NodeListOf<HTMLElement>;
      
      if (placeholders.length === 2) {
        const [leftPlaceholder, rightPlaceholder] = placeholders;

        leftPlaceholder.style.top = '50%';
        leftPlaceholder.style.left = '25%';
        leftPlaceholder.style.transform = 'translate(-50%, -50%) rotate(-6deg)';

        rightPlaceholder.style.top = '50%';
        rightPlaceholder.style.left = '75%';
        rightPlaceholder.style.transform = 'translate(-50%, -50%) rotate(6deg)';
      }
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
