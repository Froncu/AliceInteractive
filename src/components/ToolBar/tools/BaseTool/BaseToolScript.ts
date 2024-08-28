import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseTool',
  
  setup() {
    function activate() {
      console.log(1);
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