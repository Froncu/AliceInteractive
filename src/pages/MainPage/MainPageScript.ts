import { defineComponent } from 'vue';
import { router } from '@/router';
import { sessionId } from '@/app';

export default defineComponent({
  name: 'MainPage',
  setup() {
    // Check if the sessionId equals 'admin7589'
    const isAdmin = sessionId === 'admin7589';

    function startGames() {
      router.push({
        name: 'gamePage',
        query: { sessionId: sessionId }
      });
    }

    function goToAdminPage() {
      router.push({
        name: 'adminPage'
      });
    }

    function goToResultAdminPage() {
      router.push({
        name: 'resultAdminPage'
      });
    }

    return {
      startGames,
      goToAdminPage,
      goToResultAdminPage,
      isAdmin  // Return the isAdmin flag to be used in the template
    };
  }
});
