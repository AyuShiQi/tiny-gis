import { createRouter, createWebHistory } from 'vue-router'

// home
const homeView  = () => import('@/views/home-view/index.vue')
// const newProjectView = () => import('@/views/home-view/childComps/newProject.vue')
// const myProjectView = () => import('@/views/home-view/childComps/myProject.vue')
// const templateCenterView = () => import('@/views/home-view/childComps/templateCenter.vue')
// const profileView = () => import('@/views/home-view/childComps/profile.vue')
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
      redirect: '/home'
    },
    {
      path: '/home',
      component: homeView,
      // children: [
      //   {
      //     path: '/home/new-project',
      //     component: newProjectView
      //   },
      // ]
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