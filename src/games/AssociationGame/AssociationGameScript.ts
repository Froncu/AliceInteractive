import { defineComponent, onMounted, ref } from 'vue';
import * as fabric from 'fabric';

export default defineComponent({
  name: 'CanvasComponent',
  setup() {
    const canvas = ref<fabric.Canvas | null>(null);

    onMounted(() => {
      canvas.value = new fabric.Canvas('myCanvas');
    });

    const addRectangle = () => {
      if (canvas.value) {
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          fill: 'red',
          width: 100,
          height: 100,
        });
        canvas.value.add(rect);
      }
    };

    const addCircle = () => {
      if (canvas.value) {
        const circle = new fabric.Circle({
          left: 200,
          top: 200,
          fill: 'blue',
          radius: 50,
        });
        canvas.value.add(circle);
      }
    };

    return {
      addRectangle,
      addCircle,
    };
  },
});
