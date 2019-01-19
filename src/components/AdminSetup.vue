<template lang="html">
  <div class="admin card-panel">
    <h2>Game Setup</h2>
    <h4>MAKE SURE TO REFRESH AFTER EACH ACTION</h4>
    <!-- How to use the page (order of buttons to press):
    1. Assign kill codes -> Refresh button
    2. Create Test Teams -> REFRESH THE PAGE
    3. Check to make sure teams look good in table
    4. Assign Initial Targets -> REFRESH THE PAGE
    5. Check to make sure team assignments look good in table
    6. Finalize Teams -->
    <!-- <button class="btn red" @click="generateKillCodeList">Generate Kill Codes</button>
    <br><br><button class="btn red" @click="clearFakeUsers">Clear Fakes</button>
    <br><br>Enter number of fake users per dynasty:
    <input class="inputField" type="text" name="fakeFire" v-model="fake_fire"></input>
    <input class="inputField" type="text" name="fakeWater" v-model="fake_water"></input>
    <input class="inputField" type="text" name="fakeEarth" v-model="fake_earth"></input>
    <input class="inputField" type="text" name="fakeAir" v-model="fake_air"></input>
    <br><br><button class="btn red" @click="createFakeUsers">Create Fakes</button> -->
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
    <br>
    <button class="btn red" @click="assignKillCodes">Assign Kill Codes</button>
    <button class="btn green" @click="separateByDynasty">REFRESH</button>
    <br><br>Enter number of teams per dynasty: <input class="inputField" type="text" name="numTeams" v-model="num_teams"></input>
    <button class="btn red" @click="createTestTeams">Create Test Teams</button>
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
    <br><br>
    <button class="btn red" @click="assignInitialTargets">Assign Initial Targets</button><br><br>
    <button class="btn blue" @click="pushTeamAssignmentToCloud">Finalize Teams</button>
    <button class="btn red" @click="deleteTeams">Delete Team Objects</button>
    <!-- <button class="btn red" @click="updateAllAcceptedKillCodes">Update Accepted Kill Codes</button> -->
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
      fake_air: "Air",
      HIGHEST_TEAM_NUM: 0
    }
  },
  created () {
    //Logic here makes it so that the tables are up to date with each refresh
    var self = this
    //Calls method to get the most up to date dynasty split based on current users
    this.separateByDynasty()
    //Counts number of users in each dynasty based on what's in Firebase
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
      //Pulls the test teams into an array to display in bottom table
      firebase.firestore().collection('test_teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          self.all_teams.push(doc.data())
        })
      }).then(() => {
        self.HIGHEST_TEAM_NUM = self.all_teams[self.all_teams.length-1].team_number
      })
    })
  },
  methods: {
    //Method used to align local variables / arrays with cloud
    separateByDynasty() {
      var self = this
      //Goes through users and pushes them into 4 arrays based on their dynasty
      self.fire_dynasty = []
      self.water_dynasty = []
      self.air_dynasty = []
      self.earth_dynasty = []
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
        //Update these dynasty arrays in Firebase to make them persistent in the cloud
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
    //Method called when Create Test Teams button is pressed
    createTestTeams() {
      //Based on the dynasty arrays, assigns team numbers to each user
      this.groupTeamsInDynasty(this.fire_dynasty, this.fire_teams)
      this.groupTeamsInDynasty(this.water_dynasty, this.water_teams)
      this.groupTeamsInDynasty(this.earth_dynasty, this.earth_teams)
      this.groupTeamsInDynasty(this.air_dynasty, this.air_teams)
      //Pushes those assignments into cloud on the test side
      this.createTestTeamObjects()
    },
    createTestTeamObjects() {
      //Loop for Fire dynasty
      for(var i=0; i<this.num_teams; i++) {
        var team_num = (10+i).toString()
        firebase.firestore().collection('test_teams').doc(team_num).set({
          accepted_kill_codes: [],
          dynasty: 'Fire',
          status: 'Alive',
          team_number: 10+i,
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
          team_number: 20+i,
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
          team_number: 30+i,
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
          team_number: 40+i,
          target_team: null,
          targeted_by_team: null,
          users: this.air_teams[i]
        })
      }
    },
    //Helper method to create test teams
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
    //Helper method to determine dynasty factor
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
    //Called when Finalize Teams button is pressed
    pushTeamAssignmentToCloud() {
      console.log('pushing')
      firebase.firestore().collection('test_teams').get().
      then(snapshot => {
        //Updates team number for each user in the user collection
        //Note: this does not update the team number for the users in the team object, but that's ok
        //since that array is just for checking how many users are in each team, most up to date
        //user info is in users collection
        snapshot.forEach(doc => {
          var curr_team_users = doc.data().users
          var curr_team_number = doc.data().team_number
          for(var i=0; i<curr_team_users.length; i++){
            var curr_user_email = curr_team_users[i].email
            firebase.firestore().collection('users').doc(curr_user_email).update({
              team_number: curr_team_number
            })
          }
        })
      }).then(() => {
        this.createTeamObjects()
      })
    },
    createTeamObjects() {
      //Loop for Fire dynasty
      //Copies the test teams objects over to the teams collection, thus finalizing it
      firebase.firestore().collection('test_teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var data = doc.data()
          var id = data.team_number
          firebase.firestore().collection('teams').doc(id.toString()).set({
            accepted_kill_codes: data.accepted_kill_codes,
            dynasty: data.dynasty,
            status: data.status,
            target_team: data.target_team,
            targeted_by_team: data.targeted_by_team,
            team_number: data.team_number,
            users: data.users
          })
        })
      })
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
          snapshot.forEach(doc => {
            var kill_code = kill_codes[i]
            firebase.firestore().collection('users').doc(doc.data().email).update({
              kill_code: kill_code
            })
            i++
          })
        })
      )
    },
    // updateAllAcceptedKillCodes() {
    //   for(var i=0; i<this.all_teams.length; i++) {
    //     this.updateAcceptedKillCodes(this.all_teams[i].team_number)
    //   }
    // },
    // updateAcceptedKillCodes(current_team_number) {
    //   //updates the team objects in Firebase with acceptable kill codes
    //   //Acceptable kill codes is an array made up of:
    //   // - Kill codes from target team
    //   // - Kill codes from targeted by team
    //   console.log('updating')
    //   var valid_kill_codes = []
    //   var target_team_num = null
    //   var targeted_by_team_num = null
    //   var team_ref = firebase.firestore().collection('teams').doc(current_team_number.toString())
    //   // Pulls the associated target team and targeted by team numbers based on current team number
    //   team_ref.get()
    //   .then(doc => {
    //     target_team_num = doc.data().target_team
    //     targeted_by_team_num = doc.data().targeted_by_team
    //     console.log(target_team_num + " " + targeted_by_team_num)
    //   }).then(() => {
    //     //Scrolls through users to check if user's team number is either the target or targetd by team number
    //     //If it is, add that user's kill code to valid kill code array
    //     firebase.firestore().collection('users').get()
    //     .then(snapshot => {
    //       snapshot.forEach(doc => {
    //         var team_num = doc.data().team_number
    //         if(team_num == target_team_num || team_num == targeted_by_team_num) {
    //           valid_kill_codes.push(doc.data().kill_code)
    //         }
    //       })
    //     }).then(() => {
    //       team_ref.update({
    //         accepted_kill_codes: valid_kill_codes
    //       })
    //     })
    //   })
    // },
    assignInitialTargets() {
      var teams_array = []
      var self = this
      firebase.firestore().collection('test_teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          //Assign target teams by checking dynasty
          var team_num = doc.data().team_number
          //make this editable from browser
          if(doc.data().dynasty == "Air") {
            if(doc.data().team_number == self.HIGHEST_TEAM_NUM) {
              firebase.firestore().collection('test_teams').doc(team_num.toString()).update({
                target_team: 10
              })
            } else {
                firebase.firestore().collection('test_teams').doc(team_num.toString()).update({
                  target_team: (team_num - 30 + 1)
                })
              }
          } else {
            firebase.firestore().collection('test_teams').doc(team_num.toString()).update({
              target_team: (parseInt(team_num,10) + 10)
            })
          }
        })
      }).then(() => {
        this.setTargetedTeam()
      })
    },
    setTargetedTeam() {
      firebase.firestore().collection('test_teams').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var current_team_num = doc.data().team_number
          var target_team_num = doc.data().target_team
          firebase.firestore().collection('test_teams').doc(target_team_num.toString()).update({
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
        var code_name = i + "Fire Fake"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Fire",
          team_number: null,
          kill_code: "Generated when game starts",
          code_name: code_name,
          status: "Alive"
        })
      }
      for(var i=0; i<this.fake_water; i++){
        var fake_email = i + "_water@fake.com"
        var code_name = i + "Water Fake"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Water",
          team_number: null,
          kill_code: "Generated when game starts",
          code_name: code_name,
          status: "Alive"
        })
      }
      for(var i=0; i<this.fake_earth; i++){
        var fake_email = i + "_earth@fake.com"
        var code_name = i + "Earth Fake"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Earth",
          team_number: null,
          kill_code: "Generated when game starts",
          code_name: code_name,
          status: "Alive"
        })
      }
      for(var i=0; i<this.fake_air; i++){
        var fake_email = i + "_air@fake.com"
        var code_name = i + "Air Fake"
        firebase.firestore().collection('users').doc(fake_email).set({
          email: fake_email,
          dynasty: "Air",
          team_number: null,
          kill_code: "Generated when game starts",
          code_name: code_name,
          status: "Alive"
        })
      }
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
