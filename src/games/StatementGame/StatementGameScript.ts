import { defineComponent, ref, onMounted, watchEffect } from 'vue';
import DilemmaCard from '@/components/DilemmaCard/DilemmaCard.vue';

export default defineComponent({
  name: 'StatementGame',
  components: {
    DilemmaCard
  },
  setup() {
    const imagePath = ref<string | undefined>(undefined);
    const textContent = ref<string>('Loading...'); // Default text while loading

    const imageStyle = ref<Partial<CSSStyleDeclaration>>({
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      objectFit: 'fill'
    });

    // Function to fetch data from the JSON file
    const fetchData = async () => {
      try {
        const response = await fetch('/assets/cardData.json');
        const data = await response.json();
        imagePath.value = data.imagePath;
        textContent.value = data.textContent;
      } catch (error) {
        console.error('Error fetching data:', error);
        textContent.value = 'Error loading data.';
      }
    };

    const updateImagePosition = () => {
      const cardElement = document.querySelector('.dilemma-card') as HTMLElement;
      if (cardElement) {
        imageStyle.value = {
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          objectFit: 'fill'
        };
      }
    };

    onMounted(() => {
      fetchData(); // Fetch data when component mounts
      updateImagePosition();
    });

    watchEffect(updateImagePosition);

    return {
      imagePath,
      imageStyle,
      updateImagePosition,
      textContent
    };
  }
});
