import { defineComponent, ref, watch } from 'vue';
import { TextToolSettings } from '../../tools/TextTool';

export default defineComponent({
  name: 'TextToolMenu',
  props: {
    settings: {
      type: TextToolSettings,
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
