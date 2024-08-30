import { defineComponent, ref, onUnmounted, watch, nextTick } from 'vue';
import * as fabric from 'fabric';
import WhiteBoard from '@/components/WhiteBoard/WhiteBoard.vue';

export default defineComponent({
  name: 'ShapeTool',
  props: {
    whiteBoard: {
      type: WhiteBoard || null,
      required: true,
    },
  },
  setup(props) {
    const settings = ref({
      shape: 'rectangle',
      fillColor: '#ff0000',
      strokeColor: '#000000',
      strokeWidth: 1
    });

    const shapeMapping: Record<string, typeof fabric.FabricObject> = {
      'rectangle': fabric.Rect,
      'circle': fabric.Circle,
      'triangle': fabric.Triangle
    };

    const menuVisible = ref(false);

    onUnmounted(() => {
      if (props.whiteBoard)
        props.whiteBoard.canvas().off('mouse:down', onMouseClick);
    });

    function updatePreview() {
      const canvas = document.getElementById('shapePreview') as HTMLCanvasElement;
      if (!canvas)
        return;

      const ctx = canvas.getContext('2d');
      if (!ctx)
        return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = settings.value.fillColor;
      ctx.lineWidth = settings.value.strokeWidth;
      ctx.strokeStyle = settings.value.strokeWidth ? settings.value.strokeColor : 'transparent';

      switch (settings.value.shape) {
        case 'rectangle':
          ctx.fillRect(settings.value.strokeWidth / 2,
            settings.value.strokeWidth / 2,
            canvas.width - settings.value.strokeWidth,
            canvas.height - settings.value.strokeWidth);

          ctx.strokeRect(settings.value.strokeWidth / 2,
            settings.value.strokeWidth / 2,
            canvas.width - settings.value.strokeWidth,
            canvas.height - settings.value.strokeWidth);
          break;

        case 'circle':
          ctx.beginPath();
          ctx.arc(canvas.width / 2,
            canvas.height / 2,
            Math.min(canvas.width / 2 - settings.value.strokeWidth / 2,
              canvas.height / 2 - settings.value.strokeWidth / 2),
            0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          break;

        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(settings.value.strokeWidth * 0.75, canvas.height - settings.value.strokeWidth / 2);
          ctx.lineTo(canvas.width - settings.value.strokeWidth * 0.75, canvas.height - settings.value.strokeWidth / 2);
          ctx.lineTo(canvas.width / 2, settings.value.strokeWidth);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }
    }

    function onMouseClick(event: fabric.TPointerEventInfo<MouseEvent>) {
      if (!props.whiteBoard)
        return;

      const canvas = props.whiteBoard.canvas();

      const pointer = canvas.getScenePoint(event.e);
      canvas.add(createShape(pointer));
      canvas.renderAll();
    }

    watch(() => props.whiteBoard, (newWhiteBoard, oldWhiteBoard) => {
      if (oldWhiteBoard)
        oldWhiteBoard.canvas().off('mouse:down', onMouseClick);

      if (newWhiteBoard)
        newWhiteBoard.canvas().on('mouse:down', onMouseClick);
    })

    watch(() => settings, () => {
      const input = (document.getElementById("strokeWidth") as HTMLInputElement).value;
      settings.value.strokeWidth = parseInt(input, 0);

      updatePreview();
    }, { deep: true })

    function toggleMenu() {
      menuVisible.value = !menuVisible.value;
      if (menuVisible.value)
        nextTick(updatePreview);
    }

    function changeShape(shape: string) {
      settings.value.shape = shape;
    }

    function createShape(position: { x: number, y: number }) {
      const ShapeClass = shapeMapping[settings.value.shape];
      if (!ShapeClass)
        throw new Error('Invalid shape type');

      const halfStrokeWidth = settings.value.strokeWidth / 2.0;

      const shape = new ShapeClass({
        selectable: false,
        left: position.x,
        top: position.y,
        originX: 'center',
        originY: 'center',
        width: 64 - settings.value.strokeWidth / 2.0,
        height: 64 - settings.value.strokeWidth / 2.0,

        fill: settings.value.fillColor,
        stroke: settings.value.strokeColor,
        strokeWidth: settings.value.strokeWidth
      });

      if (ShapeClass === fabric.Circle)
        (shape as fabric.Circle).radius = 32 - halfStrokeWidth;
      else if (ShapeClass === fabric.Triangle) {
        (shape as fabric.Triangle).width -= halfStrokeWidth;
        (shape as fabric.Triangle).height -= halfStrokeWidth;
      }

      return shape;
    }

    return {
      menuVisible,
      settings,
      toggleMenu,
      changeShape,
      updatePreview
    };
  },
});
