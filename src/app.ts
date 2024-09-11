import { onMounted } from 'vue';
import { router } from './router';

export const sessionId = 'Test01';

export default {
  name: 'App',
  setup() {
    onMounted(() => {
      router.push({
        name: 'loginPage',
        query: { sessionId: sessionId }
      });
    })
  }
};