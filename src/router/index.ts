import { getToken } from '@/global/local-storage-option'
import { createRouter, createWebHistory } from 'vue-router'

// home
const homeView = () => import('@/views/home-view/index.vue')
const projectView = () => import('@/views/home-view/project-view/index.vue')
const moduleView = () => import('@/views/home-view/module-view/index.vue')
const profileView = () => import('@/views/home-view/profile-view/index.vue')
const settingView = () => import('@/views/home-view/setting-view/index.vue')
// login
const loginView = () => import('@/views/home-view/login-view/index.vue')
// edit
const editView = () => import('@/views/edit-view/index.vue')
// my-project
// const myProjectAllView = () => import('@/views/home-view/childComps/my-project/all-project.vue')
// const myProjectTableView = () => import('@/views/home-view/childComps/my-project/table-project.vue')
// const myProjectChartView = () => import('@/views/home-view/childComps/my-project/chart-project.vue')
// const myProjectRecycleView = () => import('@/views/home-view/childComps/my-project/recycle-project.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home/project'
    },
    {
      path: '/home',
      component: homeView,
      children: [
        {
          path: '/home/project',
          meta: { requiresAuth: true },
          component: projectView
        },
        {
          path: '/home/module',
          meta: { requiresAuth: true },
          component: moduleView
        },
        {
          path: '/home/profile',
          meta: { requiresAuth: true },
          component: profileView
        },
        {
          path: '/home/setting',
          meta: { requiresAuth: true },
          component: settingView
        },
        {
          path: '/home/login',
          meta: { requiresAuth: false },
          component: loginView
        }
      ]
    },
    {
      path: '/edit/:id',
      meta: { requiresAuth: true },
      component: editView
    },
    // {
    //   path: '/login',
    //   component: loginView
    // },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/not-found-view/index.vue')
    },
    {
      path: '/:pathMatch(.*)',
      redirect: '/404'
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = getToken()

  if (to.meta.requiresAuth && !token) {
    // 需要登录但没登录
    next('/home/login')
  } else {
    next()
  }
})

export default router
