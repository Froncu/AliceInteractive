import { createRouter, createWebHistory } from 'vue-router';
import PairWiseGame from '@/games/PairWiseGame/PairWiseGame.vue';

const routes = [
    {
        path: '/PairWiseGame',
        name: 'PairWiseGame',
        component: PairWiseGame
    },
    {
        path: '/',
        redirect: '/PairWiseGame'
    }
];
export const router = createRouter({
    history: createWebHistory(),
    routes
});

