import { createRouter, createWebHistory } from 'vue-router';
import HelloWordView from '@/views/HelloWordView.vue';

const routes = [
    {
        path: '/',
        component: HelloWordView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
