import { createRouter, createWebHistory } from 'vue-router'

// home
const homeView  = () => import('@/views/home-view/index.vue')
const projectView = () => import('@/views/home-view/project-view/index.vue')
const moduleView = () => import('@/views/home-view/module-view/index.vue')
const profileView = () => import('@/views/home-view/profile-view/index.vue')
const settingView = () => import('@/views/home-view/setting-view/index.vue')
// my-project
// const myProjectAllView = () => import('@/views/home-view/childComps/my-project/all-project.vue')
// const myProjectTableView = () => import('@/views/home-view/childComps/my-project/table-project.vue')
// const myProjectChartView = () => import('@/views/home-view/childComps/my-project/chart-project.vue')
// const myProjectRecycleView = () => import('@/views/home-view/childComps/my-project/recycle-project.vue')

// login
// const loginView = () => import('@/views/login-view/loginView')

export default createRouter({
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
          component: projectView
        },
        {
          path: '/home/module',
          component: moduleView
        },
        {
          path: '/home/profile',
          component: profileView
        },
        {
          path: '/home/setting',
          component: settingView
        },
      ]
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