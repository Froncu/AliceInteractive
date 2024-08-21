import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'PlaceHolder',
  props: {
    image: {
      type: String as PropType<string>,
      default: ''
    },
    text: {
      type: String as PropType<string>,
      default: ''
    }
  }
});