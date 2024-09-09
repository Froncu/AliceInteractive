import { defineComponent, ref, watch, onMounted } from 'vue';
import { EmojiToolSettings } from '@/components/tools/EmojiTool';
import emojiData from 'openmoji/data/openmoji.json';

interface Emoji {
  hexcode: string;
  annotation: string;
  group: string;
}

interface EmojiCategory {
  name: string;
  emojis: Emoji[];
}

export default defineComponent({
  name: 'EmojiToolMenu',
  props: {
    settings: {
      type: EmojiToolSettings,
      required: true
    }
  },
  setup(props, { emit }) {
    const localSettings = ref({ ...props.settings });
    const emojis = ref<Emoji[]>(emojiData);
    const categories = ref<EmojiCategory[]>([]);
    const filteredEmojis = ref<Emoji[]>([]);
    const selectedCategory = ref<string | null>(null);

    onMounted(() => {
      categorizeEmojis();
    });

    const categorizeEmojis = () => {
      const categoryMap: { [key: string]: Emoji[] } = {};
      emojis.value.forEach((emoji: Emoji) => {
        if (!categoryMap[emoji.group]) {
          categoryMap[emoji.group] = [];
        }
        categoryMap[emoji.group].push(emoji);
      });

      categories.value = Object.keys(categoryMap).map(categoryName => ({
        name: categoryName,
        emojis: categoryMap[categoryName]
      }));
    };

    const selectCategory = (categoryName: string) => {
      selectedCategory.value = categoryName;
      filteredEmojis.value = categories.value.find(category => category.name === categoryName)?.emojis || [];
    };

    const searchEmojis = () => {
      const query = localSettings.value.query.toLowerCase();
      if (query) {
        filteredEmojis.value = emojis.value.filter(emoji =>
          emoji.annotation.toLowerCase().includes(query)
        );
      } else {
        filteredEmojis.value = [];
      }
    };

    const selectEmoji = (emoji: Emoji) => {
      localSettings.value.chosenEmoji = getEmojiUrl(emoji.hexcode);
    };

    const getEmojiUrl = (hexcode: string) => {
      return `https://cdn.jsdelivr.net/npm/openmoji@13.0.0/color/svg/${hexcode}.svg`;
    };

    // Hide emoji if image doesn't load
    const handleImageError = (emoji: Emoji) => {
      filteredEmojis.value = filteredEmojis.value.filter(e => e !== emoji);
    };

    watch(() => localSettings, () => {
      emit('settingsChanged', localSettings.value);
    }, { deep: true });

    return {
      localSettings,
      categories,
      filteredEmojis,
      selectedCategory,
      selectCategory,
      selectEmoji,
      searchEmojis,
      handleImageError,
      getEmojiUrl
    };
  },
});
