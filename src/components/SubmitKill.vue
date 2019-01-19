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
    <button class="btn blue" @click="resetLastKill">Reset last kill</button>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      kill_code: null,
      target_team_codes: [],
      targeted_by_team_codes: [],
      danger_list_codes: [],
      success_feedback: null,
      fail_feedback: null,
      target_email: null,
      num_kills: null,
      team_num: null,
      target_team_num: null,
      targeted_by_team_num: null,
      killed_user_team_num: null,
    }
  },
  created() {
    var user = firebase.auth().currentUser
    var self = this
    firebase.firestore().collection('users').doc(user.email).get()
    .then(doc => {
      self.team_num = doc.data().team_number
    })
  },
  methods: {
    submitKill() {
      //Check to see if code is valid
      this.success_feedback = null
      this.fail_feedback = null
      this.target_team_codes = []
      this.targeted_by_team_codes = []
      var self = this
      //First, grab the target team number and targeted by team number based on current user
      firebase.firestore().collection('teams').doc(self.team_num.toString()).get()
      .then(doc => {
        self.target_team_num = doc.data().target_team
        self.targeted_by_team_num = doc.data().targeted_by_team
      })
      .then(() => {
        //Go through all users and pull Alive/Danger status users with corresponding target/targeted by team numbers
        firebase.firestore().collection('users').get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            if(doc.data().team_number == self.target_team_num) {
              if(doc.data().status == "Alive" || doc.data().status == "Danger") {
                self.target_team_codes.push(doc.data().kill_code)
              }
            }
            if(doc.data().team_number == self.targeted_by_team_num) {
              if(doc.data().status == "Alive" || doc.data().status == "Danger") {
                self.targeted_by_team_codes.push(doc.data().kill_code)
              }
            }
          })
        })
        .then(() => {
          console.log('target team codes: ' + self.target_team_codes)
          console.log('targeted by team codes: ' + self.targeted_by_team_codes)
          if(this.checkCode()) {
            firebase.firestore().collection('users').where('kill_code','==',this.kill_code).get()
            .then(snapshot => {
              snapshot.forEach(doc => {
                this.target_email = doc.data().email
                this.killed_user_team_num = doc.data().team_number
                this.success_feedback = "Congratulations! You've successfully killed " + doc.data().code_name
                self.kill_code = null
              })
            })
              .then(() => {
                this.updateTargetKilledStatus()
                this.increasePlayerKillCount()
              })
            .then(() => {
              this.checkIfFinalKillCode()
            })
            } else {
              this.fail_feedback = "Incorrect kill code. Try again."
              this.kill_code = null
          }
        })
      })
    },
    checkCode() {
      return (this.target_team_codes.indexOf(this.kill_code) > -1 || this.targeted_by_team_codes.indexOf(this.kill_code) > -1)
    },
    updateTargetKilledStatus() {
      firebase.firestore().collection('users').doc(this.target_email)
      .update({status: 'Dead'})
    },
    increasePlayerKillCount() {
      var user = firebase.auth().currentUser
      var self = this
      firebase.firestore().collection('users').doc(user.email).get()
      .then(doc => {
        self.num_kills = doc.data().num_kills
        firebase.firestore().collection('users').doc(user.email).update(
          {
            num_kills: self.num_kills + 1,
            days_since_last_kill: 0
          }
        )
      })
    },
    checkIfFinalKillCode() {
      var target_team_users = []
      firebase.firestore().collection('users').where('team_number','==',this.killed_user_team_num).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if(doc.data().status == "Alive" || doc.data().status == "Danger") {
            target_team_users.push(doc.data())
          }
        })
      })
      .then(() => {
        if(target_team_users.length == 0){
          this.assignNewTarget()
        } else {
          console.log('not last target')
        }
      })
    },
    //Logic in this method takes a generic approach regardless of what team the killer is on
    //Reason for this is if killer kills someone on the danger list that is on a team they are not targeting
    assignNewTarget() {
      var killed_user___targeted_by_team_num = null //Team number of killed user's targeted by team number
      var killed_user___targeted_by_team_dynasty = null //Dynasty of killed user's targeted by team
      var team_targeting_circle = []
      //Populate targeting circle array with team objects
      firebase.firestore().collection('teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          team_targeting_circle.push({
            team_number: doc.data().team_number,
            target_team: doc.data().target_team,
            targeted_by_team: doc.data().targeted_by_team,
            dynasty: doc.data().dynasty
          })
        })
      })
      .then(() => {
        //Populate variables that will not change and that are needed to check dynasty alignment and set link in chain
        var index___killed_user_team = team_targeting_circle.map(team => team.team_number).indexOf(this.killed_user_team_num)
        //Below variable represents team number of the team that KILLED the dead team
        killed_user___targeted_by_team_num = team_targeting_circle[index___killed_user_team].targeted_by_team
        var index___killed_user_team_targeted_by = team_targeting_circle.map(team => team.team_number).indexOf(killed_user___targeted_by_team_num)
        //Below variable represents the dynasty of the team that KILLED the dead team
        killed_user___targeted_by_team_dynasty = team_targeting_circle[index___killed_user_team_targeted_by].dynasty
        var new_target_team_num = team_targeting_circle[index___killed_user_team].target_team
        //Check to make sure next team is not same dynasty, if it is, move on to next
        var same_dynasty = true
        while(same_dynasty) {
          var index___target_team = team_targeting_circle.map(team => team.team_number).indexOf(new_target_team_num)
          var target_team_dynasty = team_targeting_circle[index___target_team].dynasty
          if(target_team_dynasty == killed_user___targeted_by_team_dynasty) {
            new_target_team_num = team_targeting_circle[index___target_team].target_team
          } else {
            same_dynasty = false
            console.log('Found a non-match!')
          }
        }
      //Once target team is confirmed (nest then's)
        firebase.firestore().collection('teams').doc(this.killed_user_team_num.toString()).update({
          status: "Dead",
          target_team: null,
          targeted_by_team: null
        })
        firebase.firestore().collection('teams').doc(new_target_team_num.toString()).update({
          targeted_by_team: killed_user___targeted_by_team_num
        })
        firebase.firestore().collection('teams').doc(killed_user___targeted_by_team_num.toString()).update({
          target_team: new_target_team_num
        })
      })
    },
    //Helper method for testing
    resetLastKill() {
      firebase.firestore().collection("teams").doc("41").update({
        targeted_by_team: 11,
        target_team: 10
      })
      firebase.firestore().collection("teams").doc("11").update({
        target_team: 41
      })
      firebase.firestore().collection("users").doc("1_air@fake.com").update({
        status: "Alive"
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
