import { defineComponent, ref } from 'vue';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';

export default defineComponent({
  name: 'AssociationGame',
  components: {
    WhiteBoard
  },
  setup() {
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();

    return {
      whiteBoard
    };
  }
});