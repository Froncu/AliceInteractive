import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/pages/LoginPage/LoginPage.vue';
import MainPage from '@/pages/MainPage/MainPage.vue';
import GamePage from '@/pages/GamePage/GamePage.vue';

const routes = [
  {
    path: '/LoginPage',
    name: 'loginPage',
    component: LoginPage
  },
  {
    path: '/MainPage',
    name: 'mainPage',
    component: MainPage
  },
  {
    path: '/GamePage',
    name: 'gamePage',
    component: GamePage
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});