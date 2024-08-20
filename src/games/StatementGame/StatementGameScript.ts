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
