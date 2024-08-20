import { defineComponent, ref, onMounted } from 'vue';
import DilemmaCard from '@/components/DilemmaCard/DilemmaCard.vue';

export default defineComponent({
  name: 'StatementGame',
  components: {
    DilemmaCard
  },
  setup() {
    const imagePath = ref<string | undefined>(undefined);
    const textContent = ref<string>('Loading...');

    const imageStyle = ref<Partial<CSSStyleDeclaration>>({
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'auto',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    });

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

    onMounted(() => {
      fetchData();
    });

    return {
      imagePath,
      imageStyle,
      textContent
    };
  }
});