<template lang="html">
  <div class="admin center card-panel">
    <h2>Admin page</h2>
    <button class="btn red" @click="generateKillCodeList">Generate Kill Codes</button>
    <br><br><button class="btn red" @click="clearFakeUsers">Clear Fakes</button>
    <br><br>Enter number of fake users per dynasty:
    <input class="inputField" type="text" name="fakeFire" v-model="fake_fire"></input>
    <input class="inputField" type="text" name="fakeWater" v-model="fake_water"></input>
    <input class="inputField" type="text" name="fakeEarth" v-model="fake_earth"></input>
    <input class="inputField" type="text" name="fakeAir" v-model="fake_air"></input>
    <br><br><button class="btn red" @click="createFakeUsers">Create Fakes</button>
    <br><br><button class="btn red" @click="separateByDynasty">Separate by Dynasty</button>
    <br><br>Enter number of teams per dynasty: <input class="inputField" type="text" name="numTeams" v-model="num_teams"></input>
    <button class="btn red" @click="groupTeams">Group Teams</button>
    <button class="btn red" @click="pushTeamAssignmentToCloud">Update Teams</button>
    <br><button class="btn red" @click="createTeamObjects">Create Team Objects</button>
    <button class="btn red" @click="deleteTeams">Delete Team Objects</button>
    <br><button class="btn red" @click="assignInitialTargets">Assign Initial Targets</button>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data () {
    return {
      fire_dynasty: [],
      water_dynasty: [],
      air_dynasty: [],
      earth_dynasty: [],
      fire_teams: [],
      water_teams: [],
      earth_teams: [],
      air_teams:[],
      num_teams: 1,
      fake_fire: "Fire",
      fake_water: "Water",
      fake_earth: "Earth",
      fake_air: "Air"
    }
  },
  methods: {
    assignTeams() {
      this.separateByDynasty()
      this.groupTeams()
    },
    separateByDynasty() {
      var self = this
      firebase.firestore().collection('users').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if(doc.data().dynasty == 'Fire') {
            self.fire_dynasty.push(doc.data())
          } else if (doc.data().dynasty == 'Water') {
            self.water_dynasty.push(doc.data())
          } else if (doc.data().dynasty == 'Air') {
            self.air_dynasty.push(doc.data())
          } else {
            self.earth_dynasty.push(doc.data())
          }
        })
      }).then(() => {
        console.log('shuffling')
        self.shuffleArray(self.fire_dynasty)
        self.shuffleArray(self.water_dynasty)
        self.shuffleArray(self.air_dynasty)
        self.shuffleArray(self.earth_dynasty)
        console.log(this.fire_dynasty)
        console.log(this.water_dynasty)
      })
    },
    groupTeams() {
      this.groupTeamsInDynasty(this.fire_dynasty)
      this.groupTeamsInDynasty(this.water_dynasty)
      this.groupTeamsInDynasty(this.earth_dynasty)
      this.groupTeamsInDynasty(this.air_dynasty)
      console.log(this.fire_dynasty)
      console.log(this.water_dynasty)
    },
    groupTeamsInDynasty(dynasty_array) {
      var dyn_factor = this.determineDynastyFactor(dynasty_array)
      for(var i=0; i<dynasty_array.length; i++) {
        dynasty_array[i].team_number = i % this.num_teams + dyn_factor
      }
    },
    determineDynastyFactor(dynasty_array) {
      if(dynasty_array == this.fire_dynasty) {
        return 10
      } else if(dynasty_array == this.water_dynasty) {
        return 20
      } else if(dynasty_array == this.earth_dynasty) {
        return 30
      } else {
        return 40
      }
    },
    pushTeamAssignmentToCloud() {
      console.log('pushing')
      var users = firebase.firestore().collection('users')
      for(var i=0; i<this.fire_dynasty.length; i++) {
        var ref = users.doc(this.fire_dynasty[i].email)
        ref.update({
          team_number: this.fire_dynasty[i].team_number
        })
      }
      for(var i=0; i<this.water_dynasty.length; i++) {
        var ref = users.doc(this.water_dynasty[i].email)
        ref.update({
          team_number: this.water_dynasty[i].team_number
        })
      }
      for(var i=0; i<this.earth_dynasty.length; i++) {
        var ref = users.doc(this.earth_dynasty[i].email)
        ref.update({
          team_number: this.earth_dynasty[i].team_number
        })
      }
      for(var i=0; i<this.air_dynasty.length; i++) {
        var ref = users.doc(this.air_dynasty[i].email)
        ref.update({
          team_number: this.air_dynasty[i].team_number
        })
      }
    },
    generateKillCodeList(){
      var code_list = []
      var words1 = ['gigantic', 'humongous', 'ridiculous', 'precious', 'insatiable',
      'prickly', 'dubious', 'cranky', 'crafty', 'crazy', 'minty', 'fresh', 'sparkly', 'belching',
      'auspicious', 'striking', 'pretentious']
      var words2 = ['computer', 'bottle', 'pony', 'wallet', 'defibrilator', 'headlight', 'freshman',
      'clipper', 'direwolf', 'methane', 'universe', 'timetravel', 'shipwreck', 'vitamin', 'baller',
      'asian', 'domino', 'fireball', 'yoga']
      for(var i=0; i<words1.length; i++) {
        var word1 = words1[i]
        for(var j=0; j<words2.length; j++) {
          var word2 = words2[j]
          var code = word1+word2
          code_list.push(code)
        }
      }
      this.shuffleArray(code_list)
      console.log(code_list)
      firebase.firestore().collection('kill_codes').doc("existing_kill_codes").set(
        {codes_list: code_list})
    },
    clearFakeUsers() {
      firebase.firestore().collection('users').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var email = doc.data().email
          if(email.substr(email.length - 8) == "fake.com") {
            firebase.firestore().collection('users').doc(email).delete()
          }
        })
      })
    },
    createFakeUsers() {
      for(var i=0; i<this.fake_fire; i++){
        var fake_email = i + "_fire@fake.com"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Fire",
          team_number: null
        })
      }
      for(var i=0; i<this.fake_water; i++){
        var fake_email = i + "_water@fake.com"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Water",
          team_number: null
        })
      }
      for(var i=0; i<this.fake_earth; i++){
        var fake_email = i + "_earth@fake.com"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Earth",
          team_number: null
        })
      }
      for(var i=0; i<this.fake_air; i++){
        var fake_email = i + "_air@fake.com"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Air",
          team_number: null
        })
      }
    },
    createTeamObjects() {
      //Loop for Fire dynasty
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (10+i).toString()
        firebase.firestore().collection('teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Fire',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null
        })
      }
      //Loop for water dynasty
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (20+i).toString()
        firebase.firestore().collection('teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Water',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null
        })
      }
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (30+i).toString()
        firebase.firestore().collection('teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Earth',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null
        })
      }
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (40+i).toString()
        firebase.firestore().collection('teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Air',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null
        })
      }
    },
    deleteTeams() {
      firebase.firestore().collection('teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var id = doc.data().team_number.toString()
          firebase.firestore().collection('team').doc(id).delete()
        })
      })
    },
    updateAcceptedKillCodes() {
      //updates the team objects in Firebase with acceptable kill codes
    },
    assignInitialTargets() {
      var teams_array = []
      firebase.firestore().collection('teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          //Assign target teams by checking dynasty
          var team_num = doc.data().team_number
          var HIGHEST_TEAM_NUM = 42
          if(doc.data().dynasty == "Air") {
            if(doc.data().team_number == HIGHEST_TEAM_NUM) {
              firebase.firestore().collection('teams').doc(team_num.toString()).update({
                target_team: 10
              })
            } else {
                firebase.firestore().collection('teams').doc(team_num.toString()).update({
                  target_team: (team_num - 30 + 1)
                })
              }
          } else {
            firebase.firestore().collection('teams').doc(team_num.toString()).update({
              target_team: (parseInt(team_num,10) + 10)
            })
          }
        })
      }).then(this.setTargetedTeam())
    },
    setTargetedTeam() {
      firebase.firestore().collection('teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var current_team_num = doc.data().team_number
          var target_team_num = doc.data().target_team
          firebase.firestore().collection('teams').doc(target_team_num.toString()).update({
            targeted_by_team: current_team_num
          })
        })
      })
    },
    shuffleArray(array) {
      console.log('in the shuffle')
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
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
