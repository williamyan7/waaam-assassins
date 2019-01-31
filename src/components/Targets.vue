<template lang="html">
  <v-layout wrap>
    <v-flex class="text-xs-center" mt-5 wrap>
      <h2> Targets </h2>
        <div
        v-for="target in targets"
        :key="target.email">
          <v-card width="80%" justify-center>
            <v-card-title class="min-width">
              <v-flex xs6>
                <img :src="target.imageURL" class="profilePicture">
              </v-flex>
              <v-flex xs6>
              <table>
                <tbody>
                  <tr>
                    <td>Code Name</td>
                    <td>{{ target.code_name }}</td>
                  </tr>
                  <tr>
                    <td>Dynasty</td>
                    <td>{{ target.dynasty }}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{{ target.status }}</td>
                  </tr>
                </tbody>
              </table>
            </v-flex>
            </v-card-title>
          </v-card>
          <br>
          </div>
        </v-flex>
    </v-layout>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      targets: [],
      team_number: null,
      target_team_number: null
    }
  },
  created() {
    this.populateTargets()
  },
  methods: {
    populateTargets() {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).get()
      .then(doc => this.team_number = doc.data().team_number)
      .then(() => {
        firebase.firestore().collection('teams').doc(this.team_number.toString()).get()
        .then(doc => this.target_team_number = doc.data().target_team)
        .then(() => {
          firebase.firestore().collection('users').where('team_number', '==', this.target_team_number).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              this.targets.push({
                code_name: doc.data().code_name,
                dynasty: doc.data().dynasty,
                status: doc.data().status,
                imageURL: doc.data().imageURL
              })
            })
          })
        })
      })
    }
  }
}
</script>

<style lang="css">
.card {
  max-width: 700px;
  margin: auto;
}
.profilePicture {
  max-height: 300px;
  max-width: 300px;
}
.min-width {
  min-width: 500px;
}
</style>
