<template lang="html">
  <v-layout wrap>
    <v-flex class="text-xs-center" mt-3 wrap>
      <h2> Danger List </h2>
        <div
        v-for="target in danger_list"
        :key="target.email">
        <v-flex xs12 sm8 offset-sm2>
          <v-card>
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
        </v-flex>
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
      danger_list: []
    }
  },
  created() {
    this.populateDangerList()
  },
  methods: {
    populateDangerList() {
      firebase.firestore().collection('users').where('status','==','Danger').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.danger_list.push(doc.data())
        })
      })
    }
  }
}
</script>

<style lang="css">
.profilePicture {
  max-height: 300px;
  max-width: 300px;
}
</style>
