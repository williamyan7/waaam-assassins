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
           :items="dynasties"
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
      dynasty: null,
      existing_code_names: [],
      kill_code: 'Generated when game starts',
      dynasties: ['Jade', 'Pearl', 'Monkey', 'Panda']
    }
  },
  methods: {
    signup() {
      var self = this
      const ref = firebase.firestore().collection('users')
      var code_name_available = this.checkCodeNameAvailability()
      if(this.name && this.email && this.password && this.code_name){
        if(code_name_available) {
          if(this.password == this.confirmPassword) {

            firebase.auth().createUserWithEmailAndPassword(this.email,this.password)
            .then(() => {
              this.generateKillCode()
            })
            .then(() => {
              ref.doc(this.email).set({
                name: this.name,
                email: this.email,
                dynasty: this.dynasty,
                code_name: this.code_name,
                uploadedPhoto: false,
                team_number: null,
                target_team_number: null,
                num_kills: 0,
                days_since_last_kill: 0,
                kill_code: self.kill_code,
                status: 'Alive'
              })
            })
            .then(() => {
                firebase.auth().currentUser.sendEmailVerification()})
            .then(() => {this.$router.push({ name: 'VerifyEmail' })})
              .catch(err => {
                console.log(err)
                this.feedback = err.message})
              }
           else {
            this.feedback = 'Passwords do not match.'
          }
        } else {
          this.feedback = 'Code name is taken, please try another one.'
        }
      } else {
        this.feedback = 'Please complete all fields.'
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
    },
    generateKillCode(){
      var kill_codes = []
      firebase.firestore().collection('kill_codes').doc('existing_kill_codes').get()
      .then(doc => {
        kill_codes = doc.data().codes_list
        this.kill_code = kill_codes.pop()
        firebase.firestore().collection('kill_codes').doc('existing_kill_codes')
          .set({codes_list: kill_codes})
      })
      return new Promise((res,rej) => {
        setTimeout(() => res(), 1000)
      })
    },
    checkCodeNameAvailability() {
      return !(this.existing_code_names.indexOf(this.code_name.toLowerCase()) > -1)
    }
  },
  created() {
    var self = this
    firebase.firestore().collection('users').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        self.existing_code_names.push(doc.data().code_name.toLowerCase())
      })
    })
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
