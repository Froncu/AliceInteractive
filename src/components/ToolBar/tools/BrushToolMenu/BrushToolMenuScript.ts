import { defineComponent, ref, watch } from 'vue';
import { BrushToolSettings } from '../BrushTool';

export default defineComponent({
  name: 'BrushToolMenu',
  props: {
    settings: {
      type: BrushToolSettings,
      required: true
    }
  },
  setup(props, { emit }) {
    const localSettings = ref({ ...props.settings })

    watch(() => localSettings, () => {
      emit('settingsChanged', localSettings.value);
    }, { deep: true })

    return {
      localSettings
    };
  },
});
