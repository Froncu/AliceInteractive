import { defineComponent, PropType } from 'vue';

interface Card {
  id: number;
  title: string;
  imagePath: string;
  description: string;
}

export default defineComponent({
  name: 'CardItem',
  props: {
    card: {
      type: Object as PropType<Card>,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: false,
    },
  },
  emits: ['select'],
  methods: {
    handleClick() {
      this.$emit('select', this.card.id);
    },
  },
});


