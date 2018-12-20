// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import VueFire from 'vuefire'
import 'vuetify/dist/vuetify.min.css'
import firebase from 'firebase'

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(VueFire)

var config = {
    apiKey: "AIzaSyCSDRCUCjtctL82eSWO3055t5lg_9X-AGw",
    authDomain: "waaam-assassins-e835e.firebaseapp.com",
    databaseURL: "https://waaam-assassins-e835e.firebaseio.com",
    projectId: "waaam-assassins-e835e",
    storageBucket: "waaam-assassins-e835e.appspot.com",
    messagingSenderId: "574431317107"
  }

const firebaseApp = firebase.initializeApp(config);
firebaseApp.firestore().settings({ timestampsInSnapshots: true })

/* eslint-disable no-new */
const unsubscribe = firebase.auth().onAuthStateChanged(user => {
  new Vue({
    el: '#app',
    router,
    render: h => h(App)
  })
  unsubscribe()
})
