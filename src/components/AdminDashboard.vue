<template lang="html">
  <div class="admin center card-panel">
    <h2> Admin Dashboard </h2>
    <div class="switch">
      Signup open
      <label>
        No
        <input type="checkbox" @click="toggleSignup" v-model="signup_available">
        <span class="lever"></span>
        Yes
      </label><br>
      Leaderboard available
      <label>
        No
        <input type="checkbox" @click="toggleLeaderboard" v-model="leaderboard_available">
        <span class="lever"></span>
        Yes
      </label><br>
      Photo editing available
      <label>
        No
        <input type="checkbox" @click="togglePhotoEditing" v-model="photo_editing_available">
        <span class="lever"></span>
        Yes
      </label>
    </div>
    Current danger list threshold:
    <input class="inputField" type="text" name="danger_list_threshold" v-model="danger_list_threshold"></input>
    Current auto die threshold:
    <input class="inputField" type="text" name="auto_die_threshold" v-model="auto_die_threshold"></input>
    <button class="btn red" @click="updateThresholds">Update Thresholds</button>
    <p>Check photos <a href="/photocheck">here</a>.</p>
    <p>Game setup <a href="/admin-setup">here</a>.</p>
    <br><br>
    <button class="btn red" @click="updateDangerList">Update Danger List</button><br>
    <h5>Alive Teams Setup</h5>
    <table>
      <thead>
        <tr>
          <th>Team #</th>
          <th>Dynasty</th>
          <th>Targeted by team</th>
          <th>Target team</th>
          <th># Alive</th>
          <th># Danger</th>
          <th># Dead</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(team,index) in alive_teams" :key="index">
          <td>{{ team.team_number }}
          <td>{{ team.dynasty }}</td>
          <td>{{ team.targeted_by_team }}</td>
          <td>{{ team.target_team }}</td>
          <td>{{ team.num_alive }}</td>
          <td>{{ team.num_danger }}</td>
          <td>{{ team.num_dead }}</td>
        </tr>
      </tbody>
    </table>
    <h5>Dead Teams</h5>
    <table>
      <thead>
        <tr>
          <th>Team #</th>
          <th>Dynasty</th>
          <th>Targeted by team</th>
          <th>Target team #</th>
          <th># Alive</th>
          <th># Danger</th>
          <th># Dead</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(team,index) in dead_teams" :key="index">
          <td>{{ team.team_number }}
          <td>{{ team.dynasty }}</td>
          <td>{{ team.targeted_by_team }}</td>
          <td>{{ team.target_team }}</td>
          <td>{{ team.num_alive }}</td>
          <td>{{ team.num_danger }}</td>
          <td>{{ team.num_dead }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data () {
    return {
      alive_teams: [],
      dead_teams: [],
      all_users: [],
      all_teams: [],
      user_info: [],
      danger_list_deaths_user_emails: [],
      danger_list_threshold: null,
      auto_die_threshold: null,
      leaderboard_available: null,
      photo_editing_available: null,
      signup_available: null
    }
  },
  created() {
    this.fillArrays()
    firebase.firestore().collection('kill_codes').doc('danger_list_thresholds').get()
    .then(doc => {
      this.danger_list_threshold = doc.data().danger_list
      this.auto_die_threshold = doc.data().auto_die
      this.leaderboard_available = doc.data().leaderboard_available
      this.photo_editing_available = doc.data().photo_editing_available
      this.signup_available = doc.data().signup_available
    })
  },
  methods: {
    fillArrays() {
      firebase.firestore().collection('teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.all_teams.push(doc.data())
        })
      })
      .then(() => {
        firebase.firestore().collection('users').get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.all_users.push(doc.data())
          })
        })
        .then(() => {
          for(var i=0; i<this.all_teams.length; i++) {
            var num_alive = 0
            var num_dead = 0
            var num_danger = 0
            var current_team_number = this.all_teams[i].team_number
            for(var j=0; j<this.all_users.length; j++) {
              if(this.all_users[j].team_number == current_team_number) {
                if(this.all_users[j].status == "Alive") {
                  num_alive++
                }
                if(this.all_users[j].status == "Dead") {
                  num_dead++
                }
                if(this.all_users[j].status == "Danger") {
                  num_danger++
                }
              }
            }
            this.user_info.push({
              team_number: current_team_number,
              num_dead: num_dead,
              num_alive: num_alive,
              num_danger: num_danger
            })
          }
          for(var k=0;k<this.all_teams.length;k++) {
            var team_number = this.all_teams[k].team_number
            var dynasty = this.all_teams[k].dynasty
            var status = this.all_teams[k].status
            var target_team = this.all_teams[k].target_team
            var targeted_by_team = this.all_teams[k].targeted_by_team
            var index___team_in_user_array = this.user_info.map(team => team.team_number).indexOf(team_number)
            var num_dead = this.user_info[index___team_in_user_array].num_dead
            var num_alive = this.user_info[index___team_in_user_array].num_alive
            var num_danger = this.user_info[index___team_in_user_array].num_danger
            if(status == "Alive") {
              this.alive_teams.push({
                team_number: team_number,
                dynasty: dynasty,
                status: status,
                target_team: target_team,
                targeted_by_team: targeted_by_team,
                num_dead: num_dead,
                num_alive: num_alive,
                num_danger: num_danger
              })
            } else {
              this.dead_teams.push({
                team_number: team_number,
                dynasty: dynasty,
                status: status,
                target_team: target_team,
                targeted_by_team: targeted_by_team,
                num_dead: num_dead,
                num_alive: num_alive,
                num_danger: num_danger
              })
            }
          }
        })
      })
    },
    updateDangerList() {
      //Increment everyone's days since last kill by 1
      firebase.firestore().collection('users').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var days_since_kill = doc.data().days_since_last_kill + 1
          var email = doc.data().email
          if(doc.data().status == "Alive" || doc.data().status == "Danger") {
            if(days_since_kill <= this.danger_list_threshold) {
              firebase.firestore().collection('users').doc(email.toString()).update({
                days_since_last_kill: days_since_kill,
              })
            }
            if(days_since_kill > this.danger_list_threshold) {
              firebase.firestore().collection('users').doc(email.toString()).update({
                days_since_last_kill: days_since_kill,
                status: "Danger"
              })
            }
            if(days_since_kill > this.auto_die_threshold) {
              this.danger_list_deaths_user_emails.push(email)
              firebase.firestore().collection('users').doc(email.toString()).update({
                days_since_last_kill: days_since_kill,
                status: "Dead"
              })
            }
          }
        })
      })
      .then(() => {
        this.updateTeamTargets()
      })
    },
    updateTeamTargets() {
      if(this.danger_list_deaths_user_emails.length > 0) {
        for(var i=0; i<this.danger_list_deaths_user_emails.length; i++) {
          var email = this.danger_list_deaths_user_emails[i]
          this.checkIfFinalKillCode(email)
        }
      }
    },
    updateThresholds() {
      firebase.firestore().collection('kill_codes').doc('danger_list_thresholds').update({
        auto_die: parseInt(this.auto_die_threshold,10),
        danger_list: parseInt(this.danger_list_threshold,10)
      })
    },
    //Code from Submit Kill for when a person auto dies and they are the last in their team
    checkIfFinalKillCode(killed_user_email) {
      var target_team_users = []
      var killed_user_team_num = null
      firebase.firestore().collection('users').where('email','==',killed_user_email).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          killed_user_team_num = doc.data().team_number
        })
      })
      .then(() => {
        firebase.firestore().collection('users').where('team_number','==',killed_user_team_num).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            if(doc.data().status == "Alive" || doc.data().status == "Danger") {
              target_team_users.push(doc.data())
            }
          })
        })
      })
      .then(() => {
        if(target_team_users.length == 0){
          this.assignNewTarget(killed_user_team_num)
        } else {
          console.log('not last target')
        }
      })
    },
    //Logic in this method takes a generic approach regardless of what team the killer is on
    //Reason for this is if killer kills someone on the danger list that is on a team they are not targeting
    assignNewTarget(killed_user_team_num) {
      var killed_user___targeted_by_team_num = null //Team number of killed user's targeted by team number
      var killed_user___targeted_by_team_dynasty = null //Dynasty of killed user's targeted by team
      var team_targeting_circle = []
      var original_target_value = 99999
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
        console.log(team_targeting_circle)
        //Populate variables that will not change and that are needed to check dynasty alignment and set link in chain
        var index___killed_user_team = team_targeting_circle.map(team => team.team_number).indexOf(killed_user_team_num)
        //Below variable represents team number of the team that KILLED the dead team
        killed_user___targeted_by_team_num = team_targeting_circle[index___killed_user_team].targeted_by_team
        var index___killed_user_team_targeted_by = team_targeting_circle.map(team => team.team_number).indexOf(killed_user___targeted_by_team_num)
        //Below variable represents the dynasty of the team that KILLED the dead team
        killed_user___targeted_by_team_dynasty = team_targeting_circle[index___killed_user_team_targeted_by].dynasty
        //Target of team that was just killed
        var new_target_team_num = team_targeting_circle[index___killed_user_team].target_team
        firebase.firestore().collection('teams').doc(killed_user_team_num.toString()).get()
        .then(doc => {
          original_target_value = doc.data().original_target_team
        })
        .then(() => {
          //Check to make sure next team is not same dynasty, if it is, move on to next
          var same_dynasty = true
          //If there is an original link, make team target that team
          console.log(original_target_value)
          if(original_target_value != null) {
            console.log('reconnect the chain!')
            var same_dynasty = false
            new_target_team_num = original_target_value
          }
          while(same_dynasty) {
            var index___target_team = team_targeting_circle.map(team => team.team_number).indexOf(new_target_team_num)
            var target_team_dynasty = team_targeting_circle[index___target_team].dynasty
            if(target_team_dynasty == killed_user___targeted_by_team_dynasty) {
              //Update to maintain original link for when this team dies
              firebase.firestore().collection('teams').doc(killed_user___targeted_by_team_num.toString()).update({
                original_target_team: new_target_team_num
              })
              new_target_team_num = team_targeting_circle[index___target_team].target_team
            } else {
              same_dynasty = false
              console.log('Found a non-match!')
            }
          }
        //Once target team is confirmed (nest then's)
          firebase.firestore().collection('teams').doc(killed_user_team_num.toString()).update({
            status: "Dead",
            target_team: null,
            targeted_by_team: null
          }).then(() => {
            console.log('updating complete (dead team)')
            firebase.firestore().collection('teams').doc(new_target_team_num.toString()).update({
              targeted_by_team: killed_user___targeted_by_team_num
            }).then(() => {
              console.log('updating complete (target team)')
              firebase.firestore().collection('teams').doc(killed_user___targeted_by_team_num.toString()).update({
                target_team: new_target_team_num
              }).then(() => {
                console.log('updating complete (targeted by team)')
                })
              })
            })
        })
      })
    },
    toggleLeaderboard() {
      firebase.firestore().collection('kill_codes').doc('danger_list_thresholds').update({
        leaderboard_available: !this.leaderboard_available
      })
    },
    togglePhotoEditing() {
      firebase.firestore().collection('kill_codes').doc('danger_list_thresholds').update({
        photo_editing_available: !this.photo_editing_available
      })
    },
    toggleSignup() {
      firebase.firestore().collection('kill_codes').doc('danger_list_thresholds').update({
        signup_available: !this.signup_available
      })
    }
  }
}
</script>

<style lang="css">
.admin {
  max-width: 1000px;
  margin-top: 40px;
  margin-left: auto;
  margin-right: auto;
}
.inputField {
  max-width: 50px;
}
</style>
