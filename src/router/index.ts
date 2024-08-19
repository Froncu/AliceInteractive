import { createRouter, createWebHistory } from 'vue-router';
import StatementGame from '@/games/StatementGame/StatementGame.vue';

const routes = [
    {
        path: '/statementgame',
        name: 'StatementGame',
        component: StatementGame
    },
    {
        path: '/',
        redirect: '/statementgame'
    }
];
export const router = createRouter({
    history: createWebHistory(),
    routes
});

