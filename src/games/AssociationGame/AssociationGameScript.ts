import { defineComponent, ref } from 'vue';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';
import ToolBar from '@/components/ToolBar/ToolBar.vue';
import BaseTool from '@/components/ToolBar/tools/BaseTool/BaseTool.vue';

export default defineComponent({
  name: 'AssociationGame',
  components: {
    WhiteBoard,
    ToolBar,
    BaseTool
  },
  setup() {
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();
    const toolBar = ref<InstanceType<typeof ToolBar>>();
    const tool = ref<InstanceType<typeof BaseTool>>();

    return {
      whiteBoard,
      toolBar,
      tool
    };
  }
});