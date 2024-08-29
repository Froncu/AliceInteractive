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

    function startUseActiveTool(event: fabric.TPointerEventInfo) {
      if (!whiteBoard.value || activeToolIndex == -1)
        return;

      props.tools[activeToolIndex].startUse(
        whiteBoard.value.canvas(),
        { x: event.scenePoint.x, y: event.scenePoint.y });

      whiteBoard.value.canvas().on('mouse:move', useActiveTool);
      useActiveTool(event);
    }

    function useActiveTool(event: fabric.TPointerEventInfo) {
      if (!whiteBoard.value || activeToolIndex == -1)
        return;

      props.tools[activeToolIndex].use(
        whiteBoard.value.canvas(),
        { x: event.scenePoint.x, y: event.scenePoint.y });
    }

    function endUseActiveTool(event: fabric.TPointerEventInfo) {
      if (!whiteBoard.value || activeToolIndex == -1)
        return;

      props.tools[activeToolIndex].endUse(
        whiteBoard.value.canvas(),
        { x: event.scenePoint.x, y: event.scenePoint.y });

      whiteBoard.value.canvas().off('mouse:move', useActiveTool);
    }


    function setTargetWhiteBoard(targetWhiteBoard: InstanceType<typeof WhiteBoard>) {
      whiteBoard.value = targetWhiteBoard;
    }

    watch(whiteBoard, (newWhiteBoard, oldWhiteBoard) => {
      if (oldWhiteBoard) {
        oldWhiteBoard.canvas().off('mouse:down', startUseActiveTool);
        oldWhiteBoard.canvas().off('mouse:move', useActiveTool);
        oldWhiteBoard.canvas().off('mouse:up', endUseActiveTool);
      }

      if (newWhiteBoard) {
        newWhiteBoard.canvas().on('mouse:down', startUseActiveTool);
        newWhiteBoard.canvas().on('mouse:up', endUseActiveTool);
      }
    }, { immediate: true });

    return {
      chooseTool,
      setTargetWhiteBoard,
    };
  },
});
