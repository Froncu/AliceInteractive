import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

export default {
  name: 'App',
  data() {
    return {
      isFullScreen: false,
      currentGame: null,
    };
  },
  setup() {
    const router = useRouter();
    onMounted(() => {
      router.push('/statementgame');
    });
  }
};