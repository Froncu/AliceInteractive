import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainMenu',
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
