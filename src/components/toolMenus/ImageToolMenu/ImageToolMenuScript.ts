import { defineComponent, ref, watch } from 'vue';
import { createClient, Photo } from 'pexels';
import { ImageToolSettings } from '@/components/tools/ImageTool';

export default defineComponent({
  name: 'ImageToolMenu',
  props: {
    settings: {
      type: ImageToolSettings,
      required: true
    }
  },
  setup(props, { emit }) {
    const localSettings = ref({ ...props.settings });
    const client = createClient('P8hl5z3ILCXHdzXqBx1cLMYCN8Lnfb8X778VcuvslCmJCjkCH0SCO1sL');

    const photos = ref<Photo[]>([]);
    const searchQuery = ref(localSettings.value.query);
    const selectedPhoto = ref<string | null>(null);
    const currentPage = ref(1);  // Track the current page
    const totalPages = ref(1);   // Store the total number of pages

    const onSearch = () => {
      localSettings.value.query = searchQuery.value;
      emit('settingsChanged', localSettings.value);

      // Call the Pexels API with pagination support
      client.photos.search({ query: searchQuery.value, per_page: 12, page: currentPage.value }).then(response => {
        if ('photos' in response) {
          photos.value = response.photos;
          totalPages.value = Math.ceil(response.total_results / 12);  // Calculate total pages
        } else {
          console.error('Error fetching data from Pexels API:', response);
        }
      }).catch(error => {
        console.error('Error fetching data from Pexels API:', error);
      });
    };

    const handlePhotoSelect = (url: string) => {
      localSettings.value.photoURL = url;
      selectedPhoto.value = url;
    };

    // Handle the next page
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
        onSearch();  // Fetch results for the new page
      }
    };

    // Handle the previous page
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value -= 1;
        onSearch();  // Fetch results for the new page
      }
    };

    watch(() => localSettings, () => {
      emit('settingsChanged', localSettings.value);
    }, { deep: true });

    return {
      localSettings,
      searchQuery,
      photos,
      selectedPhoto,
      currentPage,
      totalPages,
      onSearch,
      handlePhotoSelect,
      nextPage,
      prevPage
    };
  },
});