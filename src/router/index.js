import Vue from 'vue'
import firebase from 'firebase'
import Router from 'vue-router'
import LandingPage from '@/components/LandingPage'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import VerifyEmail from '@/components/VerifyEmail'
import About from '@/components/About'
import Profile from '@/components/Profile'
import Team from '@/components/Team'
import Targets from '@/components/Targets'
import Leaderboard from '@/components/Leaderboard'
import DangerList from '@/components/DangerList'
import AdminDashboard from '@/components/AdminDashboard'
import AdminSetup from '@/components/AdminSetup'
import SubmitKill from '@/components/SubmitKill'
import PhotoCheck from '@/components/PhotoCheck'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'LandingPage', component: LandingPage,
      beforeEnter: (to, from, next) => {
        const isAuthenticated = firebase.auth().currentUser
        if(isAuthenticated) {
          next('Profile')
        } else {
          next()
        }
      }},
    { path: '/login', name: 'Login', component: Login },
    { path: '/signup', name: 'Signup', component: Signup },
    { path: '/verifyemail', name: 'VerifyEmail', component: VerifyEmail },
    { path: '/rules', name: 'About', component: About },
    { path: '/admin-setup', name: 'Admin Setup', component: AdminSetup,
      beforeEnter: (to, from, next) => {
        var email = firebase.auth().currentUser.email
        const isAdmin = (email == 'williamyan7@gmail.com' || email == 'willyan@wharton.upenn.edu' || 'linyex@wharton.upenn.edu' )
        if(isAdmin) {
          next()
        } else {
          next('/')
        }
      }},
    { path: '/admin-dashboard', name: 'Admin Dashboard', component: AdminDashboard,
      beforeEnter: (to, from, next) => {
        var email = firebase.auth().currentUser.email
        const isAdmin = (email == 'williamyan7@gmail.com' || email == 'willyan@wharton.upenn.edu' || 'linyex@wharton.upenn.edu' )
        if(isAdmin) {
          next()
        } else {
          next('/')
        }
      }},
    { path: '/photocheck', name: 'Photo Check', component: PhotoCheck,
      beforeEnter: (to, from, next) => {
        var email = firebase.auth().currentUser.email
        const isAdmin = (email == 'williamyan7@gmail.com' || email == 'willyan@wharton.upenn.edu' || 'linyex@wharton.upenn.edu' )
        if(isAdmin) {
          next()
        } else {
          next('/')
        }
      }},
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true} },
    { path: '/team', name: 'Team', component: Team, meta: { requiresAuth: true} },
    { path: '/targets', name: 'Targets', component: Targets, meta: { requiresAuth: true} },
    { path: '/leaderboard', name: 'Leaderboard', component: Leaderboard, meta: { requiresAuth: true} },
    { path: '/dangerlist', name: 'DangerList', component: DangerList, meta: { requiresAuth: true} },
    { path: '/submitkill', name: 'SubmitKill', component: SubmitKill, meta: { requiresAuth: true} }
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
