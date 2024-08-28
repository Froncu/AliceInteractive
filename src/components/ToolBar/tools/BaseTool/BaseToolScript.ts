import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseTool',
  
  setup() {
    function activate() {
      //base activate
    }

    function deactivate() {
      //base deactivate
    }

    return {
      activate,
      deactivate
    }
  }
});