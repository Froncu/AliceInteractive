import { defineComponent, ref } from 'vue';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';
import ShapeTool from '@/components/ToolBar/tools/ShapeTool/ShapeTool.vue';

export default defineComponent({
  name: 'AssociationGame',
  components: {
    WhiteBoard,
    ShapeTool
  },
  setup() {
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();

    return {
      whiteBoard
    };
  }
});
