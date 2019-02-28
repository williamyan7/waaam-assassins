<template lang="html">
  <div class="verify card-panel">
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center">
        <h4>Please verify your email then re-login</h4>
        <button @click="logout" class="btn blue">Click to Re-Login</button>
        <button @click="resendEmail" class="btn green">Resend verification email</button>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  methods: {
    logout() {
      firebase.auth().signOut().then(() => {
        this.$router.push({ name: 'Login' })
      })
    },
    resendEmail() {
      firebase.auth().currentUser.sendEmailVerification()
    }
  }
}
</script>

<style lang="css">
.verify {
  margin-top: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>
