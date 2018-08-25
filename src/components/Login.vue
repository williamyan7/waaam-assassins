<template lang="html">
  <div class="login">
    <form class="card-panel" @submit.prevent="login">
      <div class="field" >
      <h2 class="center red-text">Login</h2>
        <label for="email" class="label">Email:</label>
        <input type="email" name="email" v-model="email">
      </div>
      <div class="field">
        <label for="password" class="label">Password:</label>
        <input type="password" name="password" v-model="password">
      </div>
      <p class="red-text center" v-if="feedback">{{ feedback }}</p>
      <div class="field center">
        <button class="btn red">Login</button><br><br>
        <a class="red-text" @click="forgotPassword">Forgot Password?</a>
        <div class="resetPassword" v-if="forgot_PW && !email_sent && valid_recovery_email">
          <input type="email" placeholder="Enter email" v-model="resetEmail"></input>
          <button @click="resetPassword" class="btn grey">Reset Password</button>
        </div>
        <div v-if="email_sent">
          <span class="red--text">Email sent!</span>
        </div>
        <div v-if="!valid_recovery_email">
          <span class="red--text">Email does not exist</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  name: 'Login',
  data() {
    return {
      email: null,
      password: null,
      feedback: null,
      forgot_PW: false,
      resetEmail: '',
      email_sent: false,
      valid_recovery_email: true
    }
  },
  methods: {
    login() {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then(user => {
        this.$router.push({ name: 'Profile' })
      }).catch(error => {
        this.feedback = error.message
      })
    },
    forgotPassword() {
      this.forgot_PW = !this.forgot_PW
    },
    resetPassword() {
      firebase.auth().sendPasswordResetEmail(this.resetEmail)
      .then(() => {
        this.email_sent = true
      }).catch(err => {
        this.valid_recovery_email = false
      })
    }
  }
}
</script>

<style lang="css">
.login {
  margin-top: 40px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.login h2{
  font-size: 2.4em;
}
.login .field {
  margin-bottom: 16px
}
.label {
  font-size: 1em;
}
</style>
