<template lang="html">
  <div class="admin center card-panel">
    <h2> Email Dashboard </h2>
    <h4> Most recent kills </h4>
    Enter how many kills to see:
    <input class="inputField" type="text" name="num_kills_displayed" v-model="num_kills_displayed"></input>
    <button @click="populateKilledArray" class="btn blue">Refresh</button>
    <div
    v-for="killed in kill_log_show"
    :key="killed.killed_code_name">
      <v-flex xs12 sm8 offset-sm2>
        <v-card>
          <v-card-title class="min-width">
            <v-flex xs6>
              <img :src="killed.killed_photo" class="killedPhoto">
            </v-flex>
            <v-flex xs6>
            <table>
              <tbody>
                <tr>
                  <td>Killed Code Name</td>
                  <td>{{ killed.killed_code_name }}</td>
                </tr>
                <tr>
                  <td>Killer Code Name</td>
                  <td>{{ killed.killer_code_name }}</td>
                </tr>
                <tr>
                  <td>Kill submission time</td>
                  <td>{{ killed.kill_time }}</td>
                </tr>
              </tbody>
            </table>
          </v-flex>
          </v-card-title>
        </v-card>
      </v-flex>
      <br>
    </div>
    <h4> 1 day from danger list </h4>
    <div
    v-for="danger in next_day_danger"
    >
      <table>
        <tbody>
          <tr>
            <td>{{ danger.email }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h4> 3 days from auto death </h4>
    <div
    v-for="death in three_day_die"
    >
      <table>
        <tbody>
          <tr>
            <td>{{ death.email }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data () {
    return {
      kill_log: [],
      kill_log_show: [],
      next_day_danger: [],
      three_day_die: [],
      users: [],
      danger_list_threshold: null,
      auto_kill_threshold_minus_2: null,
      num_kills_displayed: 10
    }
  },
  created() {
    firebase.firestore().collection('kill_codes').doc('kill_log').get()
    .then(doc => {
      this.kill_log = doc.data().kill_log
    }).then(() => {this.populateKilledArray()})
    firebase.firestore().collection('users').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        if(doc.data().status == "Alive" || doc.data().status == "Danger") {
          this.users.push(doc.data())
        }
      })
    }).then(() => {
      firebase.firestore().collection('kill_codes').doc("danger_list_thresholds").get()
      .then(doc => {
        this.danger_list_threshold = doc.data().danger_list
        this.auto_kill_threshold_minus_2 = doc.data().auto_die-2
      })
      .then(() => {
        this.populateDangerListArray()
        this.populateDeathListArray()
      })
    })
  },
  methods: {
    populateKilledArray() {
      this.kill_log_show = null
      if(this.num_kills_displayed > (this.kill_log.length + 1)) {
        this.kill_log_show = this.kill_log.slice()
        this.kill_log_show.reverse()
      } else {
        this.kill_log_show = this.kill_log.slice(this.kill_log.length-this.num_kills_displayed)
        this.kill_log_show.reverse()
      }
    },
    populateDangerListArray() {
      for(var i =0; i<this.users.length; i++) {
        if(this.users[i].days_since_last_kill == this.danger_list_threshold) {
          this.next_day_danger.push(this.users[i])
        }
      }
    },
    populateDeathListArray() {
      for(var i =0; i<this.users.length; i++) {
        if(this.users[i].days_since_last_kill == this.auto_kill_threshold_minus_2) {
          this.three_day_die.push(this.users[i])
        }
      }
    }
  }
}
</script>

<style lang="css">
.killedPhoto {
  max-width: 150px;
  max-height: 150px;
}
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
