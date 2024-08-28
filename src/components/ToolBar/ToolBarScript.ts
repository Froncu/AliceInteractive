import { defineComponent } from 'vue';
import BaseTool from './tools/BaseTool/BaseTool.vue';

export default defineComponent({
  name: 'ToolBar',
  components: {
    BaseTool,
  },
  data() {
    return {
      tools: [] as { name: string, component: any }[],
    };
  },
  methods: {
    addTool() {
      const newTool = {
        name: 'Tool' + (this.tools.length + 1),
        component: BaseTool,
      };
      if (!this.tools.find((tool) => tool.name === newTool.name)) {
        this.tools.push(newTool);
      }
    },
    removeTool(index: number) {
      this.tools.splice(index, 1);
    },
  },
});