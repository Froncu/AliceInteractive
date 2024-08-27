import { defineComponent, ref, onMounted } from 'vue';
import * as fabric from 'fabric';

export default defineComponent({
  name: 'WhiteBoard',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props) {
    let canvasFabric: fabric.Canvas;
    const canvasHTML = ref<HTMLCanvasElement>();

    onMounted(() => {
      canvasFabric = new fabric.Canvas(props.name);
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    });

    function resizeCanvas() {
      if (!canvasHTML.value)
        return;

      // TODO: this is ugly and probably not a good idea, it should be handeled differentely
      const parent = canvasHTML.value.parentElement?.parentElement?.parentElement;

      if (parent)
        canvasFabric.setDimensions({ width: parent.clientWidth, height: parent.clientHeight });
    }

    function canvas() {
      return canvasFabric;
    }

    return {
      canvas
    }
  }
});
