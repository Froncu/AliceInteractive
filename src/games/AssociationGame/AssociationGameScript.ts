import { defineComponent, ref } from 'vue';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';
import ToolBar from '@/components/ToolBar/ToolBar.vue';
import { ShapeTool } from '@/components/ToolBar/tools/ShapeTool';
import { BrushTool } from '@/components/ToolBar/tools/BrushTool';

export default defineComponent({
  name: 'AssociationGame',
  components: {
    WhiteBoard,
    ToolBar
  },
  setup() {
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();
    const tools = [new ShapeTool, new BrushTool];

    return {
      whiteBoard,
      tools
    };
  }
});
