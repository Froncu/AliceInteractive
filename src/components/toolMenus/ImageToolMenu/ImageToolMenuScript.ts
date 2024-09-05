import { defineComponent, ref, watch } from 'vue';
import { createClient, Photo } from 'pexels';
import { ImageTool, ImageToolSettings } from '@/components/tools/ImageTool';

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

    const onSearch = () => {
      localSettings.value.query = searchQuery.value; 
      emit('settingsChanged', localSettings.value); 

      client.photos.search({ query: searchQuery.value, per_page: 12 }).then(response => {
        if ('photos' in response) { 
          photos.value = response.photos; 
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

    watch(() => localSettings, () => {
      emit('settingsChanged', localSettings.value);
    }, { deep: true });

    return {
      localSettings,
      searchQuery,
      photos, 
      selectedPhoto,
      onSearch,
      handlePhotoSelect
    };
  },
});
