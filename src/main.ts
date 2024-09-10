import App from './App.vue';
import { createApp } from 'vue';
import { router } from './router';
import '../firebaseConfig.js'

const vueApp = createApp(App);
vueApp.use(router);
vueApp.mount('#app');
