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
      textContent
    };
  }
});
