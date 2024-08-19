import { defineComponent, markRaw } from "vue";
import AnimatedBackground from "@/components/AnimatedBackground/AnimatedBackground.vue";



export default defineComponent({
  name: "StatementGame",
  components: {
    AnimatedBackground: markRaw(AnimatedBackground),
  },
  setup() {
  

    return {

    };
  },
 
  methods: {
   
  },

});
