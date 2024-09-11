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
    const selectedCategory = ref<string | null>(null);  // Currently selected category
    const filteredEmojis = ref<any[]>([]);              // Holds emojis for search results
    const categories = ref<Record<string, any[]>>({});  // Holds categories with arrays of emojis

    const emojiData = localSettings.value.emojis;

    // Ensure categories are loaded and emojis are categorized
    const ensureCategoriesLoaded = () => {
      categorizeEmojis();
    };

    // Load the emojis and categorize them on component mount
    onMounted(() => {
      ensureCategoriesLoaded();
    });

    const categorizeEmojis = () => {
      for (const [category, subcategories] of Object.entries(emojiData)) {
        const emojiArray: any[] = [];
        for (const subcategory of Object.values(subcategories)) {
          if (Array.isArray(subcategory)) {
            emojiArray.push(...subcategory); // Push all emojis from subcategories
          }
        }
        categories.value[category] = emojiArray; // Store categorized emojis
      }
    };

    const selectCategory = (category: string) => {
      selectedCategory.value = category;
      filteredEmojis.value = categories.value[category] || []; // Show all emojis for the selected category
    };

    const selectEmoji = (emoji: any) => {
      localSettings.value.chosenEmoji = emoji.emoji;
      emit('settingsChanged', localSettings.value); // Notify tool of emoji selection
    };

    // Search through all categories, not just the selected one
    const searchEmojis = () => {
      const query = localSettings.value.query.toLowerCase();
      filteredEmojis.value = []; // Reset filtered emojis

      if (query) {
        // Create an array to store all filtered emojis from every category
        const allFilteredEmojis: any[] = [];

        // Loop through all categories and search through their emojis
        for (const emojiArray of Object.values(categories.value)) {
          const matchingEmojis = emojiArray.filter((emoji: any) =>
            emoji.name.toLowerCase().includes(query)  // Match query to emoji name
          );
          allFilteredEmojis.push(...matchingEmojis); // Add matching emojis to the result array
        }

        // Set filtered emojis to the search results
        filteredEmojis.value = allFilteredEmojis;

        // If there are no results, keep filteredEmojis empty
        if (!allFilteredEmojis.length) {
          console.log('No emojis found');
        }
      } else if (selectedCategory.value) {
        // If no search query, show emojis from the selected category
        filteredEmojis.value = categories.value[selectedCategory.value] || [];
      } else {
        // Show all emojis across categories if no query or category selected
        filteredEmojis.value = Object.values(categories.value).flat();
      }
    };

    // Watch for changes to settings and emit back to the tool
    watch(() => localSettings, () => {
      emit('settingsChanged', localSettings.value);
    }, { deep: true });

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
