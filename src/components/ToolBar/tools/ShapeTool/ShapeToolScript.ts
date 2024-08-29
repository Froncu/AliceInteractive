import { defineComponent, inject } from 'vue';
import BaseTool from '../BaseTool/BaseTool.vue';
import * as fabric from 'fabric';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';

export default defineComponent({
  name: 'ShapeTool',
  extends: BaseTool/* ,
  setup(props, context) {
    // Use props and context to access inherited properties and methods
    const { activate: baseActivate, deactivate: baseDeactivate } = context.attrs as any;

    // Override the activate method
    function activate() {
      // Call the base class method if needed
      if (baseActivate) {
        baseActivate();
      }
      // Custom implementation
      console.log("ShapeTool activated");
    }

    function addRect() {
      const canvas = props.whiteboard.canvas();
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 100,
        height: 100,
      });
      canvas.add(rect);
    }

    return {
      activate,
      addRect
    };
  } */
});



