<template lang="html">
  <div class="danger">
    <form class="card-panel" @submit.prevent="getDanger">
      <div class="field" >
      <h2 class="center red-text">Danger List</h2>
      </div>
      <div class="center">
        <br><button class="btn red">Danger</button><br><br>
      </div>
    </form>
    <table>
      <thead>
        <tr>
          <th>Code Name</th>
          <th>Days Since Last Kill</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(danger,index) in danger_list_users" :key="index">
          <td>{{ danger.code_name }}</td>
          <td>{{ danger.days_since_last_kill }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      team_num: null,
      danger_list_code_names: [],
      danger_list_kill_codes: [],
      danger_list_users: [],
      num_danger: 0,
      threshold: 3
    }
  },
  created() {
    var user = firebase.auth().currentUser
    var self = this
    firebase.firestore().collection('users').get()
    .then(snapshot => {
      var i = 0
      snapshot.forEach(doc => {
        console.log(i)
        if (doc.data().status == "Danger") {
          firebase.firestore().collection('users').doc(doc.data().email).update({status: 'Danger'})
          this.danger_list_code_names.splice(1,0,doc.data().code_name)
          this.danger_list_kill_codes.splice(1,0,doc.data().kill_code)
          this.danger_list_users.push(doc.data())
        }
        i++
      })
    })
  },
  methods: {
    // sleep time expects milliseconds
    sleep (time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    },
    updateDangerList() {
      firebase.firestore().collection('users').get()
      .then(snapshot => {
        var i = 0
        snapshot.forEach(doc => {
          console.log(i)
          if (doc.data().days_since_last_kill >= this.threshold){
            if (doc.data().status == "Alive") {
              firebase.firestore().collection('users').doc(doc.data().email).update({status: 'Danger'})
              this.danger_list_code_names.push(doc.data().code_name)
              this.danger_list_kill_codes.push(doc.data().kill_code)
              this.danger_list_users.push(doc.data())
              console.log(doc.data().code_name)
              console.log(doc.data().days_since_last_kill)
            } else if (doc.data().status == "Danger") {
              this.danger_list_users.splice(this.danger_list_users.indexOf(doc.data()), 1)
              this.danger_list_users.push(doc.data())
              console.log(doc.data().code_name)
              console.log(doc.data().days_since_last_kill)
            }
          } else {
            //I can probably move this to the kill submit, since you'd only turn Alive after you kill someone
            if (doc.data().status == "Danger") {
              firebase.firestore().collection('users').doc(doc.data().email).update({status: 'Alive'})
              this.danger_list_code_names.splice(this.danger_list_code_names.indexOf(doc.data().code_name),1)
              this.danger_list_kill_codes.splice(this.danger_list_kill_codes.indexOf(doc.data().kill_code),1)
              this.danger_list_users.splice(this.danger_list_users.indexOf(doc.data()), 1)
              console.log(doc.data().code_name)
              console.log(doc.data().days_since_last_kill)
            }
          }
          i++
        })
      })
      this.num_danger = this.danger_list_code_names.length
    },
    countTimeSinceLastKill() {
      firebase.firestore().collection('users').get()
      .then(snapshot => {
        var i = 0
        snapshot.forEach(doc => {
          console.log(i)
          if (doc.data().status != "Dead") {
            firebase.firestore().collection('users').doc(doc.data().email).update({ days_since_last_kill : doc.data().days_since_last_kill + 1 })
          }
          i++
        })
      })
    },
    getDanger() {
      this.countTimeSinceLastKill()
      this.updateDangerList()
    }
  }
}
</script>

<style lang="css">
</style>
