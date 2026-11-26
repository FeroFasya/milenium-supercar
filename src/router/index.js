import { createRouter, createWebHistory } from 'vue-router'
import { auth, waitForAuthReady } from '../lib/firebase'
import HomeView from '../views/HomeView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/admin/login', name: 'admin-login', component: AdminLoginView },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    await waitForAuthReady()
    if (!auth.currentUser) {
      return { name: 'admin-login' }
    }
  }
  if (to.name === 'admin-login') {
    await waitForAuthReady()
    if (auth.currentUser) {
      return { name: 'admin-dashboard' }
    }
  }
})

export default router
