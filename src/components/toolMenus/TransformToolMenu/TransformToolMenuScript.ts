import { defineComponent, ref, watch } from 'vue';
import { TransformToolSettings } from '../../tools/TransformTool';

export default defineComponent({
  name: 'TransformToolMenu',
  props: {
    settings: {
      type: TransformToolSettings,
      required: true
    }
  },
  setup(props, { emit }) {
    const localSettings = ref({ ...props.settings })

    const selectAll = () => {
      localSettings.value.selectAll = true;
    };

    const deleteObj = () => {
      localSettings.value.delete = true;
    };

    const groupObj = () => {
      localSettings.value.group = true;
    }

    const duplicateObj = () => {
      localSettings.value.duplicate = true;
    }

    watch(() => localSettings, () => {
      emit('settingsChanged', localSettings.value);
    }, { deep: true })

    return {
      localSettings,
      selectAll,
      deleteObj,
      groupObj,
      duplicateObj
    };
  },
});