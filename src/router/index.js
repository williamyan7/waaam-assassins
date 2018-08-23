import Vue from 'vue'
import firebase from 'firebase'
import Router from 'vue-router'
import LandingPage from '@/components/LandingPage'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import VerifyEmail from '@/components/VerifyEmail'
import About from '@/components/About'
import Profile from '@/components/Profile'
import Admin from '@/components/Admin'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'LandingPage', component: LandingPage,
      beforeEnter: (to, from, next) => {
        const isAuthenticated = firebase.auth().currentUser
        if(isAuthenticated) {
          next('EditProfile')
        } else {
          next()
        }
      }},
    { path: '/login', name: 'Login', component: Login },
    { path: '/signup', name: 'Signup', component: Signup },
    { path: '/verifyemail', name: 'VerifyEmail', component: VerifyEmail },
    { path: '/about', name: 'About', component: About },
    { path: '/admin', name: 'Admin', component: Admin,
      beforeEnter: (to, from, next) => {
        var email = firebase.auth().currentUser.email
        const isAdmin = (email == 'williamyan7@gmail.com' || email == 'willyan@wharton.upenn.edu' )
        if(isAdmin) {
          next()
        } else {
          next('/')
        }
      }},
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true} }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = firebase.auth().currentUser
  if (requiresAuth && (!isAuthenticated)) {
    next('/login')
  } else if (requiresAuth && isAuthenticated) {
    const verifiedEmail = firebase.auth().currentUser.emailVerified
    if(!verifiedEmail) {
      next('/verifyemail')
    } else {
      next()
    }
  } else {
      next()
  }
})

export default router
