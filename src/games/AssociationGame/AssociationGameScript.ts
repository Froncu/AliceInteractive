import { defineComponent, ref, onMounted } from 'vue';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';
import ToolBar from '@/components/ToolBar/ToolBar.vue';
import { BaseTool } from '@/components/ToolBar/tools/BaseTool';
import { SelectTool } from '@/components/ToolBar/tools/SelectTool';
import { MoveTool } from '@/components/ToolBar/tools/MoveTool';
import { ShapeTool } from '@/components/ToolBar/tools/ShapeTool';

export default defineComponent({
  name: 'AssociationGame',
  components: {
    WhiteBoard,
    ToolBar
  },
  setup() {
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();
    const toolBar = ref<InstanceType<typeof ToolBar>>();

    const toolbarTools: BaseTool[] = [
      new SelectTool(),
      new MoveTool(),
      new ShapeTool()
    ];

    onMounted(() => {
      if (toolBar.value && whiteBoard.value) {
        toolBar.value.setTargetWhiteBoard(whiteBoard.value);
      }
    });

    return {
      whiteBoard,
      toolBar,
      toolbarTools
    };
  }
});
  