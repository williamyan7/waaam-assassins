<template lang="html">
  <div class="admin center card-panel">
    <h2>Admin page</h2>
    <button class="btn red" @click="generateKillCodeList">Generate Kill Codes</button>
    <br><br><button class="btn red" @click="separateByDynasty">Separate by Dynasty</button>
    <br><br>Enter number of teams per dynasty<input type="text" name="numTeams" v-model="num_teams"></input>
    <button class="btn red" @click="groupTeams">Group Teams</button>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data () {
    return {
      pearl_dynasty: [],
      jade_dynasty: [],
      monkey_dynasty: [],
      panda_dynasty: [],
      num_teams: 1
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
          if(doc.data().dynasty == 'Pearl') {
            self.pearl_dynasty.push(doc.data())
          } else if (doc.data().dynasty == 'Jade') {
            self.jade_dynasty.push(doc.data())
          } else if (doc.data().dynasty == 'Monkey') {
            self.monkey_dynasty.push(doc.data())
          } else {
            self.panda_dynasty.push(doc.data())
          }
        })
      }).then(() => {
        console.log('shuffling')
        self.shuffleArray(self.pearl_dynasty)
        self.shuffleArray(self.jade_dynasty)
        self.shuffleArray(self.monkey_dynasty)
        self.shuffleArray(self.panda_dynasty)
        console.log(self.pearl_dynasty)
      })
    },
    groupTeams() {
      //split dynasty array into even and remainder pieces
      var remainder = pearl_length % this.num_teams
      var remainder_array = this.pearl_dynasty.splice(pearl_length-remainder,remainder)
      var pearl_length = this.pearl_dynasty.length
      console.log(pearl_length)
      var remainder_length = remainder_array.length
      //assign teams to even array
      var counter_pearl = 0
      while(counter_pearl < pearl_length) {
        for (var i=0; i < this.num_teams; i++) {
          this.pearl_dynasty[counter_pearl].team_number = 10+i
          counter_pearl++
        }
      }
      console.log(this.pearl_dynasty)
      //assign teams to remainder array
      console.log(remainder_array)
      //merge arrays
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
</style>
