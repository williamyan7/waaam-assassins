<template lang="html">
  <div class="admin center card-panel">
    <h2> Leaderboard </h2>
    <table>
      <thead>
        <tr>
          <th>Dynasty</th>
          <th># Kills</th>
          <th># Alive</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(dynasty,index) in dynasty_info" :key="index">
          <td>{{ dynasty.dynasty }}
          <td>{{ dynasty.num_kills }}</td>
          <td>{{ dynasty.num_alive }}</td>
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
      dynasty_info: [],
      user_info: [],
      all_users: []
    }
  },
  created() {
    this.populateData()
  },
  methods: {
    populateData() {
      firebase.firestore().collection('users').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.all_users.push(doc.data())
        })
      })
      .then(() => {
        //Populate dynasty data (aggregate kills and alive)
        var fire_num_kills = 0
        var fire_num_alive = 0
        var water_num_kills = 0
        var water_num_alive = 0
        var earth_num_kills = 0
        var earth_num_alive = 0
        var air_num_kills = 0
        var air_num_alive = 0
        for(var i=0; i<this.all_users.length; i++) {
          if(this.all_users[i].dynasty == "Fire") {
            fire_num_kills += this.all_users[i].num_kills
            if(this.all_users[i].status == "Alive" || this.all_users[i].status == "Danger") {
              fire_num_alive += 1
            }
          }
          if(this.all_users[i].dynasty == "Water") {
            water_num_kills += this.all_users[i].num_kills
            if(this.all_users[i].status == "Alive" || this.all_users[i].status == "Danger") {
              water_num_alive += 1
            }
          }
          if(this.all_users[i].dynasty == "Earth") {
            earth_num_kills += this.all_users[i].num_kills
            if(this.all_users[i].status == "Alive" || this.all_users[i].status == "Danger") {
              earth_num_alive += 1
            }
          }
          if(this.all_users[i].dynasty == "Air") {
            air_num_kills += this.all_users[i].num_kills
            if(this.all_users[i].status == "Alive" || this.all_users[i].status == "Danger") {
              air_num_alive += 1
            }
          }
        }
        this.dynasty_info.push(
        {
          dynasty: "Fire",
          num_kills: fire_num_kills,
          num_alive: fire_num_alive
        },
        {
          dynasty: "Water",
          num_kills: water_num_kills,
          num_alive: water_num_alive
        },
        {
          dynasty: "Earth",
          num_kills: earth_num_kills,
          num_alive: earth_num_alive
        },
        {
          dynasty: "Air",
          num_kills: air_num_kills,
          num_alive: air_num_alive
        })
      })
      //Populate individual user data (top 10 kills)
      
    }
  }
}
</script>

<style lang="css">
</style>
