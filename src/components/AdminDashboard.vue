<template lang="html">
  <div class="admin center card-panel">
    <h2> Admin Dashboard </h2>
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
      user_info: []
    }
  },
  created() {
    this.fillArrays()
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
  }
}
</script>

<style lang="css">

</style>
