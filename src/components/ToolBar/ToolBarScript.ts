import { defineComponent, ref, Ref, PropType, watch } from 'vue';
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
    const activeToolIndex = ref<number | null>(null);
    const whiteBoard = ref<InstanceType<typeof WhiteBoard> | null>(null);

    const chooseTool = (index: number) => {
      if (activeToolIndex.value !== null && activeToolIndex.value != index && whiteBoard.value)
        props.tools[activeToolIndex.value].onUnchosen(whiteBoard.value.canvas());

      activeToolIndex.value = index;

      if (whiteBoard.value)
        props.tools[index].onChosen(whiteBoard.value.canvas());
    };

    const useActiveTool = (event: fabric.TPointerEventInfo) => {
      if (activeToolIndex.value !== null && whiteBoard.value)
        props.tools[activeToolIndex.value].use(whiteBoard.value.canvas(), { x: event.viewportPoint.x, y: event.viewportPoint.y });
    };

    const setTargetWhiteBoard = (targetWhiteBoard: InstanceType<typeof WhiteBoard> | null) => {
      whiteBoard.value = targetWhiteBoard;
    };

    watch(whiteBoard, (newWhiteBoard, oldWhiteBoard) => {
      if (oldWhiteBoard) {
        oldWhiteBoard.canvas().off('mouse:down', useActiveTool);
      }
      if (newWhiteBoard) {
        newWhiteBoard.canvas().on('mouse:down', useActiveTool);
      }
    }, { immediate: true });

    return {
      chooseTool,
      setTargetWhiteBoard,
    };
  },
});
