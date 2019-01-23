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
    <h3>Top 10 Most Kills</h3>
    <table>
      <thead>
        <tr>
          <th>Code Name</th>
          <th>Dynasty</th>
          <th># Kills</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user,index) in top_10_killers" :key="index">
          <td>{{ user.code_name }}</td>
          <td>{{ user.dynasty }}
          <td>{{ user.num_kills }}</td>
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
      all_users: [],
      top_10_killers: []
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
        this.rankKills()
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

    },
    rankKills() {
      this.all_users = this.bubbleSort(this.all_users)
      this.top_10_killers = this.all_users.slice(0,9)
    },
    //Helper functions for the sort
    compare(user_1, user_2) {
      if(user_1.num_kills < user_2.num_kills) {
        return -1
      }
      if (user_1.num_kills > user_2.num_kills) {
        return 1
      } else {
        return 0
      }
    },
    bubbleSort(array) {
      var len = array.length
      for(var i=len-1; i>=0; i--) {
        for(var j=1; j<=i; j++) {
          if(this.compare(array[j-1], array[j]) == -1) {
            var temp = array[j-1]
            array[j-1] = array[j]
            array[j] = temp
          }
        }
      }
      return array
    }
  }
}
</script>

<style lang="css">
</style>
