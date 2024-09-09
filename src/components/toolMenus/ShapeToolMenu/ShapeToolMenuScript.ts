import { defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import { ShapeToolSettings } from '../../tools/ShapeTool';

export default defineComponent({
  name: 'ShapeToolMenu',
  props: {
    settings: {
      type: ShapeToolSettings,
      required: true
    }
  },
  setup(props, { emit }) {
    const localSettings = ref({ ...props.settings })

    watch(() => localSettings, () => {
      updatePreview();
      emit('settingsChanged', localSettings.value);
    }, { deep: true })

    onMounted(() => {
      nextTick(updatePreview);
    });

    function updatePreview() {
      const canvas = document.getElementById('shapePreview') as HTMLCanvasElement;
      if (!canvas)
        return;

      const ctx = canvas.getContext('2d');
      if (!ctx)
        return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = localSettings.value.fillColor;
      ctx.lineWidth = localSettings.value.strokeWidth;
      ctx.strokeStyle = localSettings.value.strokeWidth ? localSettings.value.strokeColor : 'transparent';

      switch (localSettings.value.shape) {
        case 'rect':
          ctx.fillRect(localSettings.value.strokeWidth / 2,
            localSettings.value.strokeWidth / 2,
            canvas.width - localSettings.value.strokeWidth,
            canvas.height - localSettings.value.strokeWidth);

          ctx.strokeRect(localSettings.value.strokeWidth / 2,
            localSettings.value.strokeWidth / 2,
            canvas.width - localSettings.value.strokeWidth,
            canvas.height - localSettings.value.strokeWidth);
          break;

        case 'ellipse':
          ctx.beginPath();
          ctx.arc(canvas.width / 2,
            canvas.height / 2,
            Math.min(canvas.width / 2 - localSettings.value.strokeWidth / 2,
              canvas.height / 2 - localSettings.value.strokeWidth / 2),
            0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          break;

        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(localSettings.value.strokeWidth * 0.75, localSettings.value.strokeWidth / 2);
          ctx.lineTo(canvas.width - localSettings.value.strokeWidth * 0.75, localSettings.value.strokeWidth / 2);
          ctx.lineTo(canvas.width / 2, canvas.height - localSettings.value.strokeWidth);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }
    }

    function onStrokeWidthChange() {
      const input = (document.getElementById("strokeWidth") as HTMLInputElement).value;
      localSettings.value.strokeWidth = parseInt(input, 0);
    }

    return {
      onStrokeWidthChange,
      localSettings
    };
  },
});
