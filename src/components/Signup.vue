<template lang="html">
  <div class="signup">
    <form class="card-panel" @submit.prevent="signup">
      <h2 class="center red-text">Signup</h2>
      <div class="field">
        <label for="name" class="label">Name:</label>
        <input type="text" name="name" v-model="name">
      </div>
      <div class="field">
        <label for="email" class="label">Email:</label>
        <input type="email" name="email" v-model="email">
      </div>
      <div class="field">
        <label for="code_name" class="label">Code Name:</label><span @click="generateRandomName" class="random">Generate Random</span>
        <input type="text" name="code_name" v-model="code_name">
      </div>
      <div class="field">
        <label for="password" class="label">Password:</label>
        <input type="password" name="password" v-model="password">
      </div>
      <div class="field">
        <label for="confirmPassword" class="label">Confirm Password:</label>
        <input type="password" name="confirmPassword" v-model="confirmPassword">
      </div>
      <div class="field">
        <v-flex>
          <v-select
           :items="dynasty"
           label="Select your dynasty"
           v-model="dynasty"
           ></v-select>
         </v-flex>
      </div>
      <p class="red-text center" v-if="feedback">{{ feedback }}</p>
      <div class="field center">
        <button class="btn red">Signup</button>
      </div>
    </form>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  name: 'Signup',
  data() {
    return {
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
      feedback: null,
      code_name: null,
      dynasty: ['Jade', 'Pearl', 'Monkey', 'Panda']
    }
  },
  methods: {
    signup() {
      const ref = firebase.firestore().collection('users')
      if(this.password == this.confirmPassword) {
        if(this.name && this.email && this.password){
          firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
          .then(cred => {
            ref.doc(cred.user.email).set({
                  name: this.name,
                  email: this.email,
                  dynasty: this.dynasty,
                  code_name: this.code_name,
                  uploadedPhoto: false,
                  team_number: null,
                  target_team_number: null,
                  num_kills: 0,
                  days_since_last_kill: 0
                })
              }).then(() => {
                firebase.auth().currentUser.sendEmailVerification()
              }).then(() => {this.$router.push({ name: 'VerifyEmail' })})
              .catch(err => {
                console.log(err)
                this.feedback = err.message})
            }
         else {
          this.feedback = 'Please complete all fields.'
        }
      } else {
        this.feedback = 'Passwords do not match.'
      }
    },
    generateRandomName() {
      var random_nouns = []
      var random_adj = []
      firebase.firestore().collection('code_names').doc('random_adj').get()
      .then(doc => {
        random_adj = doc.data().adj_list
        firebase.firestore().collection('code_names').doc('random_nouns').get()
        .then(doc => {
          random_nouns = doc.data().noun_list
          var adj = random_adj[Math.floor(Math.random() * random_adj.length)]
          var noun = random_nouns[Math.floor(Math.random() * random_nouns.length)]
          this.code_name = adj + " " + noun
        })
      })
    }
  }
}
</script>

<style lang="css">
.random {
  border-style: solid;
  border-width: 1px;
  margin-left: 10px;
  cursor: pointer;
  padding: 5px;
  color: red;
  border-color: red;
}
.signup {
  margin-top: 40px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.signup h2{
  font-size: 2.4em;
}
.signup .field {
  margin-bottom: 16px
}
.label {
  font-size: 1em;
}
</style>
