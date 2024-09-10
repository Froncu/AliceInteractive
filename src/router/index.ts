import { createRouter, createWebHistory } from 'vue-router';
import SignIn from '@/components/SignIn/SignIn.vue';
import MainMenu from '@/MainMenu/MainMenu.vue';
import StatementGame from '@/games/StatementGame/StatementGame.vue';
import PairWiseGame from '@/games/PairWiseGame/PairWiseGame.vue';
import AssociationGame from '@/games/AssociationGame/AssociationGame.vue';

const routes = [
    {
        path: '/SignIn',
        name: 'signIn',
        component: SignIn
    },
    {
        path: '/MainMenu',
        name: 'mainMenu',
        component: MainMenu
    },
    {
        path: '/PairWiseGame',
        name: 'pairWiseGame',
        component: PairWiseGame
    },
    {
        path: '/StatementGame',
        name: 'statementGame',
        component: StatementGame
    },
    {
        path: '/AssociationGame',
        name: 'associationGame',
        component: AssociationGame
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});