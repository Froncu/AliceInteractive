import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import SignIn from '@/components/SignIn/SignIn.vue';

export default defineComponent({
  name: 'MainMenu',
  components: {
    SignIn
  },
  setup() {
    const router = useRouter();

    function loadGame(gameType: string) {
      router.push({ name: gameType });
    }

    return {
      loadGame
    };
  }
});
