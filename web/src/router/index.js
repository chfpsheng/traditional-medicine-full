import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../views/Main.vue'),
    children: [
      {
        path: '',
        component: () => import('../views/Prescriptions.vue')
      },
      {
        path: 'prescriptions',
        name: 'Prescriptions',
        component: () => import('../views/Prescriptions.vue')
      },
      {
        path: 'doctors',
        name: 'Doctors',
        component: () => import('../views/Doctors.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router