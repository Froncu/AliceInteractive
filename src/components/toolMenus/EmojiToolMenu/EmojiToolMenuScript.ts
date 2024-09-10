import { defineComponent, ref, watch, onMounted } from 'vue';
import { EmojiToolSettings } from '@/components/tools/EmojiTool';

export default defineComponent({
  name: 'EmojiToolMenu',
  props: {
    settings: {
      type: Object as () => EmojiToolSettings,
      required: true
    }
  },
  setup(props, { emit }) {
    const localSettings = ref({ ...props.settings });
    const selectedCategory = ref<string | null>(null);
    const filteredEmojis = ref<any[]>([]); // Holds emojis for the selected category
    const categories = ref<Record<string, any[]>>({}); // Holds categories with arrays of emojis

    const ensureCategoriesLoaded = () => {
      // This function will check if categories are populated, and if not, load them
      if (Object.keys(categories.value).length === 0) {
        categorizeEmojis();
      }
    };

    // Load the emojis and categorize them on component mount
    onMounted(() => {
      ensureCategoriesLoaded();
    });

    const categorizeEmojis = () => {
      const emojiData = localSettings.value.emojis; // Assuming the emoji data is in localSettings

      if (!emojiData || Object.keys(emojiData).length === 0) {
        console.error('No emoji data found');
        return;
      }

      // Iterate through categories and create arrays of emojis for each category
      for (const [category, subcategories] of Object.entries(emojiData)) {
        const emojiArray: any[] = [];

        // Ensure subcategories is iterable (Array or Object.values)
        for (const subcategory of Object.values(subcategories)) {
          if (Array.isArray(subcategory)) {
            emojiArray.push(...subcategory); // Push all emojis from subcategories
          }
        }

        categories.value[category] = emojiArray; // Set the category array
      }
    };

    const selectCategory = (category: string) => {
      selectedCategory.value = category;
      filteredEmojis.value = categories.value[category] || [];
    };

    const selectEmoji = (emoji: any) => {
      localSettings.value.chosenEmoji = emoji.emoji; // Set the chosen emoji
      emit('settingsChanged', localSettings.value); // Notify the tool of the selection
    };

    const searchEmojis = () => {
      const query = localSettings.value.query.toLowerCase();

      if (query && selectedCategory.value) {
        // Filter emojis by query within the selected category
        filteredEmojis.value = categories.value[selectedCategory.value].filter((emoji: any) =>
          emoji.name.toLowerCase().includes(query)
        );
      } else if (selectedCategory.value) {
        // Reset filtered emojis to show all in the selected category
        selectCategory(selectedCategory.value);
      }
    };

    // Watch for changes to localSettings and ensure categories are loaded
    watch(
      () => localSettings.value.emojis,
      () => {
        ensureCategoriesLoaded();
      },
      { immediate: true, deep: true }
    );

    return {
      localSettings,
      selectedCategory,
      filteredEmojis,
      categories,
      selectCategory,
      selectEmoji,
      searchEmojis
    };
  }
});