import { defineComponent, Component, PropType, shallowRef } from 'vue';
import { BaseTool, BaseToolSettings } from '../tools/BaseTool';
import WhiteBoard from '../WhiteBoard/WhiteBoard.vue';

export default defineComponent({
  name: 'ToolBar',
  props: {
    whiteBoard: {
      type: WhiteBoard,
      required: true
    },
    tools: {
      type: Array as PropType<BaseTool[]>,
      required: true
    }
  },
  setup(props) {
    let activeTool: BaseTool | undefined;
    const activeToolMenu = shallowRef<Component | null>();
    const activeToolSettings = shallowRef<BaseToolSettings | null>();

    function onClick(toolConstructorName: string) {
      const foundTool = props.tools.find((tool) => { return tool.constructor.name === toolConstructorName; });
      if (activeTool === foundTool)
        return;

      if (activeTool)
        activeTool.onUnchosen();

      activeTool = foundTool;

      if (activeTool)
        activeTool.onChosen(props.whiteBoard.canvas());

      activeToolMenu.value = activeTool?.menu();
      activeToolSettings.value = activeTool?.settings();
    }

    function onSettingsChange(settings: BaseToolSettings) {
      activeTool?.changeSettings(settings);
    }

    return {
      activeToolMenu,
      activeToolSettings,
      onSettingsChange,
      onClick
    };
  },
});
