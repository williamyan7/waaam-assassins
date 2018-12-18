<template lang="html">
  <div class="admin card-panel">
    <h2>Admin page</h2>
    <!-- <button class="btn red" @click="generateKillCodeList">Generate Kill Codes</button> -->
    <!-- <br><br><button class="btn red" @click="clearFakeUsers">Clear Fakes</button>
    <br><br>Enter number of fake users per dynasty:
    <input class="inputField" type="text" name="fakeFire" v-model="fake_fire"></input>
    <input class="inputField" type="text" name="fakeWater" v-model="fake_water"></input>
    <input class="inputField" type="text" name="fakeEarth" v-model="fake_earth"></input>
    <input class="inputField" type="text" name="fakeAir" v-model="fake_air"></input>
    <br><br><button class="btn red" @click="createFakeUsers">Create Fakes</button> -->
    <!-- <br><button class="btn red" @click="separateByDynasty">Update Dynasties</button> -->
    <h5>Current # Users by Dynasty (refresh page for most up to date)</h5>
    <table>
      <thead>
        <tr>
          <th>Fire</th>
          <th>Water</th>
          <th>Earth</th>
          <th>Air</th>
        </tr>
      </thead>
      <tbody>
          <td>{{ num_fire }}</td>
          <td>{{ num_water }}</td>
          <td>{{ num_earth }}</td>
          <td>{{ num_air }}</td>
        </tr>
      </tbody>
    </table>
    <br><br>Enter number of teams per dynasty: <input class="inputField" type="text" name="numTeams" v-model="num_teams"></input>
    <button class="btn red" @click="groupTeams">Create Test Teams</button>
    <button class="btn red" @click="deleteTestTeams">Delete Test Teams</button>
    <h5>Current Team Setup</h5>
    <table>
      <thead>
        <tr>
          <th>Team #</th>
          <th>Dynasty</th>
          <th># of players</th>
          <th>Target team #</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(team,index) in all_teams" :key="index">
          <td>{{ team.team_number }}
          <td>{{ team.dynasty }}</td>
          <td>{{ team.users.length }}</td>
          <td>{{ team.target_team }}</td>
        </tr>
      </tbody>
    </table>
    <br>
    <button class="btn red" @click="pushTeamAssignmentToCloud">Finalize Teams</button>
    <button class="btn red" @click="deleteTeams">Delete Team Objects</button>
    <br><br><button class="btn red" @click="assignInitialTargets">Assign Initial Targets</button>
    <button class="btn red" @click="assignKillCodes">Assign Kill Codes</button>
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
      all_teams: [],
      fire_teams: [[],[],[],[],[],[],[],[],[],[]],
      water_teams: [[],[],[],[],[],[],[],[],[],[]],
      earth_teams: [[],[],[],[],[],[],[],[],[],[]],
      air_teams:[[],[],[],[],[],[],[],[],[],[]],
      num_fire: 0,
      num_water: 0,
      num_earth: 0,
      num_air: 0,
      num_teams: 1,
      fake_fire: "Fire",
      fake_water: "Water",
      fake_earth: "Earth",
      fake_air: "Air"
    }
  },
  created () {
    var self = this
    this.separateByDynasty()
    firebase.firestore().collection('dynasties').doc('Fire').get()
    .then(doc => {
      self.num_fire = doc.data().users.length
    }).then(() => {
    firebase.firestore().collection('dynasties').doc('Water').get()
    .then(doc => {
      self.num_water = doc.data().users.length
      })
    })
    .then(() => {
      firebase.firestore().collection('dynasties').doc('Earth').get()
      .then(doc => {
        self.num_earth = doc.data().users.length
      })
    })
    .then(() => {
      firebase.firestore().collection('dynasties').doc('Air').get()
      .then(doc => {
        self.num_air = doc.data().users.length
      })
    })
    .then(() => {
      firebase.firestore().collection('test_teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          self.all_teams.push(doc.data())
        })
      })
    })
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
        self.shuffleArray(self.fire_dynasty)
        self.shuffleArray(self.water_dynasty)
        self.shuffleArray(self.air_dynasty)
        self.shuffleArray(self.earth_dynasty)
      }).then(() => {
        firebase.firestore().collection('dynasties').doc('Air').update({
          users: self.air_dynasty
        })
      }).then(() => {
        firebase.firestore().collection('dynasties').doc('Earth').update({
          users: self.earth_dynasty
        })
      }).then(() => {
        firebase.firestore().collection('dynasties').doc('Fire').update({
          users: self.fire_dynasty
        })
      }).then(() => {
        firebase.firestore().collection('dynasties').doc('Water').update({
          users: self.water_dynasty
        })
      })
    },
    groupTeams() {
      this.groupTeamsInDynasty(this.fire_dynasty, this.fire_teams)
      this.groupTeamsInDynasty(this.water_dynasty, this.water_teams)
      this.groupTeamsInDynasty(this.earth_dynasty, this.earth_teams)
      this.groupTeamsInDynasty(this.air_dynasty, this.air_teams)
      this.createTestTeamObjects()
    },
    groupTeamsInDynasty(dynasty_array, dynasty_teams) {
      //dynasty_array is an unsorted list of all users in the dynasty
      //dynasty_teams is an array where each index represents a team object
      var dyn_factor = this.determineDynastyFactor(dynasty_array)
      for(var i=0; i<dynasty_array.length; i++) {
        var team_number = i % this.num_teams + dyn_factor
        dynasty_array[i].team_number = team_number
        var user = dynasty_array[i]
        var current_team = dynasty_teams[i % this.num_teams]
        current_team.push(user)
        dynasty_teams[i % this.num_teams] = current_team
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
      //Loop through all fire dynasty users and update team
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
      this.createTeamObjects()
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
    createTeamObjects() {
      //Loop for Fire dynasty
      console.log(this.fire_teams)
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (10+i).toString()
        firebase.firestore().collection('teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Fire',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null,
          users: this.fire_teams[i]
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
          targeted_by_team: null,
          users: this.water_teams[i]
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
          targeted_by_team: null,
          users: this.earth_teams[i]
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
          targeted_by_team: null,
          users: this.air_teams[i]
        })
      }
    },
    createTestTeamObjects() {
      //Loop for Fire dynasty
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (10+i).toString()
        firebase.firestore().collection('test_teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Fire',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null,
          users: this.fire_teams[i]
        })
      }
      //Loop for water dynasty
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (20+i).toString()
        firebase.firestore().collection('test_teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Water',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null,
          users: this.water_teams[i]
        })
      }
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (30+i).toString()
        firebase.firestore().collection('test_teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Earth',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null,
          users: this.earth_teams[i]
        })
      }
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (40+i).toString()
        firebase.firestore().collection('test_teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Air',
          status: 'Alive',
          team_number: team_num,
          target_team: null,
          targeted_by_team: null,
          users: this.air_teams[i]
        })
      }
    },
    assignKillCodes() {
      //Pull kill codes into array
      var kill_codes = []
      firebase.firestore().collection('kill_codes').doc('existing_kill_codes').get()
      .then(doc => {
        kill_codes = doc.data().codes_list
      })
      //Assign a kill code to each user
      .then(
        firebase.firestore().collection('users').get()
        .then(snapshot => {
          var i = 0
          console.log(i)
          snapshot.forEach(doc => {
            var kill_code = kill_codes[i]
            console.log(kill_code)
            firebase.firestore().collection('users').doc(doc.data().email).update({
              kill_code: kill_code
            })
            i++
          })
        })
      )
    },
    updateAllAcceptedKillCodes() {

    },
    updateAcceptedKillCodes(current_team_number) {
      //updates the team objects in Firebase with acceptable kill codes
      //Acceptable kill codes is an array made up of:
      // - Kill codes from target team
      // - Kill codes from targeted by team
      var valid_kill_codes = []
      var target_team_num = null
      var targeted_by_team_num = null
      firebase.firestore().collection('teams').doc(current_team_number.toString()).get()
      .then(doc => {
        target_team_num = doc.data().target_team
        targeted_by_team_num = doc.data().targeted_by_team
      }).then(() => {
        firebase.firestore().collection('users').get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            var team_num = doc.data().team_number
            if(team_num == target_team_num || team_num == targeted_by_team_num) {
              valid_kill_codes.push(doc.data().kill_code)
            }
          })
        })
      })
    },
    assignInitialTargets() {
      var teams_array = []
      firebase.firestore().collection('teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          //Assign target teams by checking dynasty
          var team_num = doc.data().team_number
          //make this editable from browser
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
    //PRIVATE HELPER FUNCTIONS
    //BELOW THIS POINT
    //-------------------
    createFakeUsers() {
      for(var i=0; i<this.fake_fire; i++){
        var fake_email = i + "_fire@fake.com"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Fire",
          team_number: null,
          kill_code: "Generated when game starts"
        })
      }
      for(var i=0; i<this.fake_water; i++){
        var fake_email = i + "_water@fake.com"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Water",
          team_number: null,
          kill_code: "Generated when game starts"
        })
      }
      for(var i=0; i<this.fake_earth; i++){
        var fake_email = i + "_earth@fake.com"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Earth",
          team_number: null,
          kill_code: "Generated when game starts"
        })
      }
      for(var i=0; i<this.fake_air; i++){
        var fake_email = i + "_air@fake.com"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Air",
          team_number: null,
          kill_code: "Generated when game starts"
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
    deleteTeams() {
      console.log("deleting")
      firebase.firestore().collection('teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var id = doc.data().team_number.toString()
          firebase.firestore().collection('teams').doc(id).delete()
        })
      })
    },
    deleteTestTeams() {
      console.log("deleting")
      firebase.firestore().collection('test_teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var id = doc.data().team_number.toString()
          firebase.firestore().collection('test_teams').doc(id).delete()
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
