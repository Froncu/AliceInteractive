import { defineComponent } from 'vue';
import { router } from '@/router';
import { sessionId } from '@/app';

export default defineComponent({
  name: 'MainPage',
  setup() {
    function startGames() {
      router.push({
        name: 'gamePage',
        query: { sessionId: sessionId }
      });
    }

    return {
      startGames
    };
  }
});
