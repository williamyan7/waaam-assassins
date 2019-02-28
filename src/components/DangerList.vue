<template lang="html">
  <v-layout wrap>
    <v-flex class="text-xs-center" mt-3 wrap>
      <h2> Danger List </h2>
      <p>A few things to remember about the danger list:</p>
        ANYONE can kill someone on the danger list, including if you are dead
        <br>Make sure you do not kill someone in your dynasty by checking below
        <br>Check this page often since it will constantly be updating
        <br>To get yourself off the danger list, simply kill someone!
      <h4>Fire Dynasty</h4>
      <div class="row">
        <picture class="column" v-for="target in danger_list_fire"
        :key="target.email">
          <img :src="target.imageURL" class="dangerListPicture">
        </picture>
      </div>
      <h4>Water Dynasty</h4>
      <div class="row">
        <picture class="column" v-for="target in danger_list_water"
        :key="target.email">
          <img :src="target.imageURL" class="dangerListPicture">
        </picture>
      </div>
      <h4>Earth Dynasty</h4>
      <div class="row">
        <picture class="column" v-for="target in danger_list_earth"
        :key="target.email">
          <img :src="target.imageURL" class="dangerListPicture">
        </picture>
      </div>
      <h4>Air Dynasty</h4>
      <div class="row">
        <picture class="column" v-for="target in danger_list_air"
        :key="target.email">
          <img :src="target.imageURL" class="dangerListPicture">
        </picture>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      danger_list_fire: [],
      danger_list_water: [],
      danger_list_earth: [],
      danger_list_air: []
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
          if(doc.data().dynasty == "Fire") {
            this.danger_list_fire.push(doc.data())
          }
          if(doc.data().dynasty == "Water") {
            this.danger_list_water.push(doc.data())
          }
          if(doc.data().dynasty == "Earth") {
            this.danger_list_earth.push(doc.data())
          }
          if(doc.data().dynasty == "Air") {
            this.danger_list_air.push(doc.data())
          }
        })
      })
    }
  }
}
</script>

<style lang="css">
.dangerListPicture {
  max-height: 120px;
  max-width: 120px;
}
img {
  padding-left: 10px;
}
</style>
