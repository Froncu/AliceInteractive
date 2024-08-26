import { createRouter, createWebHistory } from 'vue-router';
import AssociationGame from '@/games/AssociationGame/AssociationGame.vue';

const routes = [
    {
        path: '/associationgame',
        name: 'AssociationGame',
        component: AssociationGame
    },
    {
        path: '/',
        redirect: '/associationgame'
    }
];
export const router = createRouter({
    history: createWebHistory(),
    routes
});

