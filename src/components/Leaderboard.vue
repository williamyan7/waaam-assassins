<template lang="html">
  <div class="admin center card-panel leaderboard">
    <h2> Leaderboard </h2>
    <canvas id="killsChart" width="600" height="150"></canvas>
    <canvas id="aliveChart" width="600" height="150"></canvas>
    <!-- <table>
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
    </table> -->
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
import Chart from 'chart.js'
export default {
  data() {
    return {
      dynasty_info: [],
      user_info: [],
      all_users: [],
      top_10_killers: [],
      leaderboard_available: null,
      chart_kill_data: [],
      chart_alive_data: []
    }
  },
  mounted() {
    this.populateData()
  },
  methods: {
    buildCharts() {
      var ctx = document.getElementById("killsChart");
      var killsChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ["Fire", "Water", "Earth", "Air"],
              datasets: [{
                  label: '# of Kills',
                  data: this.chart_kill_data,
                  backgroundColor: [
                    'rgba(255, 0, 0, 0.3)',
                    'rgba(0, 0, 255, 0.3)',
                    'rgba(0, 255, 0, 0.3)'
                  ],
                  borderColor: [
                      'rgba(255,0,0,1)',
                      'rgba(0, 0, 235, 1)',
                      'rgba(0, 255, 0, 1)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                scales: {
                    xAxes: [{
                        gridLines: {
                            drawOnChartArea: false
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            drawOnChartArea: false
                        },
                        ticks: {
                          min: 0,
                          stepSize: 1
                        }
                    }]
                }
            }
          })
        var ctx2 = document.getElementById("aliveChart");
        var aliveChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ["Fire", "Water", "Earth", "Air"],
                datasets: [{
                    label: '% still alive',
                    data: this.chart_alive_data,
                    backgroundColor: [
                      'rgba(255, 0, 0, 0.3)',
                      'rgba(0, 0, 235, 0.3)',
                      'rgba(0, 255, 0, 0.3)'
                    ],
                    borderColor: [
                        'rgba(255,0,0,1)',
                        'rgba(0, 0, 235, 1)',
                        'rgba(0, 255, 0, 1)'
                    ],
                    borderWidth: 1
                  }]
                },
                options: {
                  scales: {
                      xAxes: [{
                          gridLines: {
                              drawOnChartArea: false
                          }
                      }],
                      yAxes: [{
                          gridLines: {
                              drawOnChartArea: false
                          },
                          ticks: {
                            min: 0,
                            max: 1,
                            stepSize: 0.1
                          }
                      }]
                  }
                }
          })
    },
    populateData() {
      firebase.firestore().collection('kill_codes').doc('danger_list_thresholds').get()
      .then(doc => {
        this.leaderboard_available = doc.data().leaderboard_available
      })
      .then(() => {
        firebase.firestore().collection('users').get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.all_users.push(doc.data())
          })
        })
        .then(() => {
          if(this.leaderboard_available == true) {
            this.rankKills()
            //Populate dynasty data (aggregate kills and alive)
            var fire_num_kills = 0
            var fire_num_alive = 0
            var fire_total = 0
            var water_num_kills = 0
            var water_num_alive = 0
            var water_total = 0
            var earth_num_kills = 0
            var earth_num_alive = 0
            var earth_total = 0
            var air_num_kills = 0
            var air_num_alive = 0
            var air_total = 0
            for(var i=0; i<this.all_users.length; i++) {
              if(this.all_users[i].dynasty == "Fire") {
                fire_num_kills += this.all_users[i].num_kills
                fire_total += 1
                if(this.all_users[i].status == "Alive" || this.all_users[i].status == "Danger") {
                  fire_num_alive += 1
                }
              }
              if(this.all_users[i].dynasty == "Water") {
                water_num_kills += this.all_users[i].num_kills
                water_total += 1
                if(this.all_users[i].status == "Alive" || this.all_users[i].status == "Danger") {
                  water_num_alive += 1
                }
              }
              if(this.all_users[i].dynasty == "Earth") {
                earth_num_kills += this.all_users[i].num_kills
                earth_total += 1
                if(this.all_users[i].status == "Alive" || this.all_users[i].status == "Danger") {
                  earth_num_alive += 1
                }
              }
              if(this.all_users[i].dynasty == "Air") {
                air_num_kills += this.all_users[i].num_kills
                air_total += 1
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
            this.chart_kill_data.push(fire_num_kills)
            this.chart_kill_data.push(water_num_kills)
            this.chart_kill_data.push(earth_num_kills)
            this.chart_kill_data.push(air_num_kills)
            this.chart_alive_data.push(fire_num_alive/fire_total)
            this.chart_alive_data.push(water_num_alive/water_total)
            this.chart_alive_data.push(earth_num_alive/earth_total)
            this.chart_alive_data.push(air_num_alive/air_total)
          }
        this.buildCharts()
        })
      })
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
.leaderboard {
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}
</style>
