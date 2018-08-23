<template>
  <v-toolbar app flat dark class="red darken-3">
    <v-toolbar-title class="white--text">
        <router-link v-if="!user" :to="{name: 'LandingPage'}">WAAAM Assassins</router-link>
        <router-link v-if="user" :to="{name: 'EditProfile'}">WAAAM Assassins</router-link>
    </v-toolbar-title>
    <v-spacer />
    <v-toolbar-items class="hidden-xs-only">
      <v-btn
        flat
        v-for="item in menuItems"
        :key="item.title"
        :to="item.path">
        <v-icon left dark>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
      <v-btn flat v-if="user" @click="logout">
          <v-icon left>exit_to_app</v-icon>
          Logout
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      user: null,
      is_admin: null,
      admin_emails: ['williamyan7@gmail.com', 'willyan@wharton.upenn.edu']
    }
  },
  computed: {
    menuItems () {
        var self = this
        if(this.user) {
          if(self.admin_emails.indexOf(this.user.email) > -1) {
            return [
              { title: 'About', path: '/about', icon: 'find_in_page' },
              { title: 'Admin', path: '/admin', icon: 'person' },
              { title: 'Profile', path: '/profile', icon: 'person' }
            ]
          } else {
              return [
                { title: 'About', path: '/about', icon: 'find_in_page' },
                { title: 'Profile', path: '/profile', icon: 'person' }
              ]
            }
        } else {
            return [
              { title: 'About', path: '/about', icon: 'find_in_page' },
              { title: 'Signup', path: '/signup', icon: 'face' },
              { title: 'Login', path: '/login', icon: 'lock_open' }
            ]
      }
    }
  },
  methods: {
    logout() {
      firebase.auth().signOut().then(() => {
        this.$router.push({ name: 'Login' })
      })
    }
  },
  created() {
    var self = this
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.user = user
      } else {
        this.user = null
      }
    })
  }
}
</script>

<style lang="css">
.margin-right {
  margin-right: 100px;
}
.margin-left {
  margin-left: 100px;
}
</style>
