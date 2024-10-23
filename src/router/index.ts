import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/pages/LoginPage/LoginPage.vue';
import MainPage from '@/pages/MainPage/MainPage.vue';
import GamePage from '@/pages/GamePage/GamePage.vue';
import FinishedPage from '@/pages/FinishedPage/FinishedPage.vue';
import AdminPage from '@/pages/AdminPage/AdminPage.vue';
import ResultAdminPage from '@/pages/ResultAdminPage/ResultAdminPage.vue';

import { sessionId } from '@/app';

//const routeSessionId= sessionId

const routes = [
  {
    path: `/LoginPage`,
    name: 'loginPage',
    component: LoginPage
  },
  {
    path: `/MainPage`,
    name: 'mainPage',
    component: MainPage
  },
  {
    path: `/GamePage`,
    name: 'gamePage',
    component: GamePage
  },
  {
    path: `/FinishedPage`,
    name: 'finishedPage',
    component: FinishedPage
  },
  {
    path: `/AdminPage`,
    name: 'adminPage',
    component: AdminPage
  },
  {
    path: `/ResultAdminPage`,
    name: 'resultAdminPage',
    component: ResultAdminPage
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});