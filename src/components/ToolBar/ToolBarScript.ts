import { defineComponent, ref, PropType, watch } from 'vue';
import * as fabric from "fabric";
import { BaseTool } from './tools/BaseTool';
import WhiteBoard from '../WhiteBoard/WhiteBoard.vue';

export default defineComponent({
  name: 'ToolBar',
  props: {
    tools: {
      type: Array as PropType<BaseTool[]>,
      required: true,
    },
  },
  setup(props) {
    let activeToolIndex = -1;
    const whiteBoard = ref<InstanceType<typeof WhiteBoard>>();

    function chooseTool(index: number) {
      if (!whiteBoard.value)
        return;

      if (activeToolIndex == index)
        return;

      if (activeToolIndex != -1)
        props.tools[activeToolIndex].onUnchosen(whiteBoard.value.canvas());

      activeToolIndex = index;

      if (activeToolIndex != -1)
        props.tools[activeToolIndex].onChosen(whiteBoard.value.canvas());
    }

    function useActiveTool(event: fabric.TPointerEventInfo) {
      if (whiteBoard.value)
        props.tools[activeToolIndex].use(
          whiteBoard.value.canvas(),
          { x: event.viewportPoint.x, y: event.viewportPoint.y });
    }

    function setTargetWhiteBoard(targetWhiteBoard: InstanceType<typeof WhiteBoard>) {
      whiteBoard.value = targetWhiteBoard;
    }

    watch(whiteBoard, (newWhiteBoard, oldWhiteBoard) => {
      if (oldWhiteBoard)
        oldWhiteBoard.canvas().off('mouse:down', useActiveTool);

      if (newWhiteBoard)
        newWhiteBoard.canvas().on('mouse:down', useActiveTool);
    }, { immediate: true });

    return {
      chooseTool,
      setTargetWhiteBoard,
    };
  },
});
