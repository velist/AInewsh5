import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('../views/NewsDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory('/AInewsh5/'),
  routes
})

export default router