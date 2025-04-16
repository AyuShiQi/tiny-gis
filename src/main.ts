import { createApp } from 'vue'
import pinia from './store'
import Router from './router'
import Viog from 'viog-ui'
import 'viog-ui/dist/viog-ui.css'
import './assets/css/normalize.css'
import './style.css'
import App from './App.vue'

createApp(App)
.use(Viog)
.use(pinia)
.use(Router)
.mount('#app')