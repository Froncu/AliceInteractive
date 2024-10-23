import { defineComponent } from 'vue';
import { router } from './router'; // Adjust the path based on your project

// Immediately extract sessionId when the script is loaded
export const sessionId: string | undefined = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  const querySessionId = urlParams.get('sessionId');

  if (querySessionId) {
    console.log('Session ID extracted:', querySessionId);
    return querySessionId;
  } else {
    console.error('Error: Invalid or missing sessionId.');
    throw new Error('Invalid or missing sessionId.');
  }
})();

export default defineComponent({
  name: 'App',
  setup() {
    console.log('Session ID set in setup:', sessionId);

    // Push to loginPage after sessionId is extracted
    router.push({
      name: 'loginPage',
      query: { sessionId: sessionId }
    });

    return {};
  }
});
