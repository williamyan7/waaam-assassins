<template lang="html">
  <v-layout wrap>
    <v-flex class="text-xs-center" mt-6 wrap>
      <h2> Photo Check </h2>
        <div
        v-for="member in team"
        :key="member.email">
        <v-flex xs12 sm8 offset-sm2>
          <v-card>
            <v-card-title class="min-width">
              <v-flex xs6>
                <img :src="member.imageURL" class="profilePicture">
              </v-flex>
              <v-flex xs6>
              <table>
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>{{ member.name }}</td>
                  </tr>
                  <tr>
                    <td>Code Name</td>
                    <td>{{ member.code_name }}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{{ member.email }}</td>
                  </tr>
                  <tr>
                    <td>Dynasty</td>
                    <td>{{ member.dynasty }}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{{ member.status }}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </v-flex>
            </v-card-title>
          </v-card>
        </v-flex>
          <br>
          </div>
        </v-flex>
    </v-layout>
</template>

<script>
import firebase from 'firebase'
//This page is to provide the admin with a quick view of all the photos and people to check the
//photos look good
export default {
  data() {
    return {
      team: [],
      team_number: null,
    }
  },
  created() {
    this.populateTeam()
  },
  methods: {
    populateTeam() {
      firebase.firestore().collection('users').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.team.push({name: doc.data().name, code_name: doc.data().code_name,
            email: doc.data().email, dynasty: doc.data().dynasty,
            status: doc.data().status, imageURL: doc.data().imageURL})
        })
      })
    }
  }
}
</script>

<style lang="css">
.card {
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.profilePicture {
  max-height: 300px;
  max-width: 300px;
}
.min-width {
  min-width: 500px;
}
</style>
