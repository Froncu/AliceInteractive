import { defineComponent, ref, watch } from 'vue';
import { BackgroundToolSettings } from '@/components/tools/BackgroundTool';

export default defineComponent({
  name: 'BackgroundToolMenu',
  props: {
    settings: {
      type: BackgroundToolSettings,
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
