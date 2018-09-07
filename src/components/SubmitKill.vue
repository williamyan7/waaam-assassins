<template lang="html">
  <div class="submitkill">
    <form class="card-panel" @submit.prevent="submitKill">
      <div class="field" >
      <h2 class="center red-text">Submit Kill</h2>
        <label for="kill_code" class="label">Kill Code:</label>
        <input type="text" name="kill_code" v-model="kill_code">
      </div>
      <div class="center">
        <br><button class="btn red">Submit</button><br><br>
      </div>
    </form>
    <div class="result">
      <p class="red-text center" v-if="fail_feedback">{{ fail_feedback }}</p>
      <p class="green-text center" v-if="success_feedback">{{ success_feedback }}</p>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      kill_code: null,
      accepted_kill_codes: [],
      success_feedback: null,
      fail_feedback: null,
      target_email: null,
      num_kills: null,
      team_num: null
    }
  },
  created() {
    var user = firebase.auth().currentUser
    var self = this
    firebase.firestore().collection('users').doc(user.email).get()
    .then(doc => {
      self.team_num = doc.data().team_number
      firebase.firestore().collection('teams').doc(self.team_num.toString()).get()
      .then(doc => {
        self.accepted_kill_codes = doc.data().accepted_kill_codes
      })
    })
  },
  methods: {
    submitKill() {
      this.success_feedback = null
      this.fail_feedback = null
      var self = this
      if(this.checkCode()) {
        firebase.firestore().collection('users').where('kill_code','==',this.kill_code).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.target_email = doc.data().email
            this.success_feedback = "Congratulations! You've successfully killed " + doc.data().code_name
          })
        }).then(() => {
        self.updateTargetKilledStatus() })
        .then(() => {
          self.updatePlayerData()})
      } else {
        this.fail_feedback = "Incorrect kill code. Try again."
      }
      this.kill_code = null
    },
    checkCode() {
      return this.accepted_kill_codes.indexOf(this.kill_code) > -1
    },
    updateTargetKilledStatus() {
      firebase.firestore().collection('users').doc(this.target_email)
      .update({status: 'Dead'})
    },
    updatePlayerData() {
      var user = firebase.auth().currentUser
      var self = this
      firebase.firestore().collection('users').doc(user.email).get()
      .then(doc => {
        self.num_kills = doc.data().num_kills
        firebase.firestore().collection('teams').doc(self.team_num.toString()).get()
        .then(doc => {
          self.accepted_kill_codes = doc.data().accepted_kill_codes
          console.log(self.accepted_kill_codes)
          self.accepted_kill_codes.splice(self.accepted_kill_codes.indexOf(self.kill_code),1)
          console.log(self.accepted_kill_codes)
        })
        .then(() => {
          firebase.firestore().collection('users').doc(user.email)
          .update({
            num_kills: self.num_kills + 1,
            days_since_last_kill: 0,
          })
        })
        .then(() => {
          console.log('update kill codes')
          firebase.firestore().collection('teams').doc(self.team_num.toString())
          .update({
            accepted_kill_codes: self.accepted_kill_codes
          })
        })
      })
    }
  }
}
</script>

<style lang="css">
.submitkill {
  margin-top: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>
