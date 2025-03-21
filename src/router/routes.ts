import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue')
      },
      {
        path: '/translation',
        name: 'translation',
        component: () => import('@/views/TranslationView.vue')
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue')
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('@/views/AboutView.vue')
      }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router 