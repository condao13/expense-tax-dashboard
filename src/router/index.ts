import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

// Hash history (#/expenses) works on static hosts like GitHub Pages without server config.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    // Lazy-loaded routes become separate JS chunks, downloaded only when visited.
    { path: '/expenses', name: 'expenses', component: () => import('../views/ExpensesView.vue') },
    { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
    // `:name` is a route param, read in the view with useRoute().params.name.
    { path: '/category/:name', name: 'category', component: () => import('../views/CategoryView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
