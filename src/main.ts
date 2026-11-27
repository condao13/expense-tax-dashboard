import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'

// Plugins are installed once, before mounting: Pinia for state, the router for pages.
createApp(App).use(createPinia()).use(router).mount('#app')
