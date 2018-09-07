<template lang="html">
  <!-- Current user profile -->
  <div class="profile card-panel">
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center">
        <h4>Welcome to your profile</h4>
        <h6>Please make sure to upload a photo</h6>
      </v-flex>
      <v-flex xs12 class="text-xs-center" mt-5>
        <img v-if="!hasImage" src="../assets/profile_placeholder.png" class="profilePicture">
        <img v-if="hasImage" :src="imageURL" class="profilePicture">
        <p>This picture will be used by opposing teams to identify you.
          You can upload any picture of yourself. The only caveat is it should
          be possible to tell that it is you (e.g. no baby pictures or highly obscured
          pictures).</p>
        <form enctype="multipart/form-data">
          <label for="uploadedImage" class="custom-file-upload grey-text text-darken-2">Upload Photo<br>(This may take a few seconds)
          <input class="photoInput" type="file" value="upload" id="uploadedImage" accept="image/*" @change="uploadImage">
          </label>
          <button @click="removeImage"><i class="material-icons grey-text text-darken-2 deleteButton">delete</i></button>
        </form>
      </v-flex>
      <div class="infoSection container no-padding">
        <table>
          <tbody>
            <tr>
              <td>Name</td>
              <td>{{ name }}</td>
            </tr>
            <tr>
              <td>Code Name</td>
              <td>{{ code_name }}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{{ email }}</td>
            </tr>
            <tr>
              <td>Dynasty</td>
              <td>{{ dynasty }}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td>{{ status }}</td>
              <td></td>
            </tr>
            <tr>
              <td>Kill Code</td>
              <td>{{ kill_code }}</td>
              <td></td>
            </tr>
            <tr>
              <td># of kills</td>
              <td>{{ num_kills }}</td>
              <td></td>
            </tr>
            <tr>
              <td>Days since last kill</td>
              <td>{{ days_since_last_kill }}</td>
              <td></td>
            </tr>
          </tbody>
        </table><br>
      </div>
    </v-layout>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      hasImage: true,
      imageURL: '',
      email: '',
      name: '',
      code_name: '',
      dynasty: '',
      status:'',
      kill_code:'',
      num_kills:'',
      days_since_last_kill:''
    }
  },
  created() {
    var self = this
    //Check to see if user has an uploaded photo
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.email)
    .get().then(doc => {
      var data = doc.data()
      self.hasImage = data.uploadedPhoto
      self.name = data.name
      self.email = data.email
      self.dynasty = data.dynasty
      self.code_name = data.code_name
      self.days_since_last_kill = data.days_since_last_kill
      self.kill_code = data.kill_code
      self.num_kills = data.num_kills
      self.status = data.status
      if(self.hasImage){
        firebase.storage().ref().child(firebase.auth().currentUser.email)
        .getDownloadURL().then(function(url) {
          self.imageURL = url
        })
      }
    })
  },
  methods: {
    uploadImage(event) {
      var file = event.target.files
      var self = this
      //Upload image
      firebase.storage().ref().child(firebase.auth().currentUser.email).put(file[0])
      .then(() => {
        //Get image URL
        firebase.storage().ref().child(firebase.auth().currentUser.email)
        .getDownloadURL().then(function(url) {
        self.imageURL = url
        self.hasImage = true
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.email)
        .update({
          uploadedPhoto: true,
          imageURL: url
        })
        }).catch(err => console.log(err))
      })
    },
    removeImage() {
      this.hasImage = false
      firebase.storage().ref().child(firebase.auth().currentUser.email).delete()
      .then(() => console.log('delete successful')).catch(err => console.log(err))
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.email)
      .update({
        uploadedPhoto: false,
        imageURL: null
      })
    }
  }
}
</script>

<style lang="css">
.profilePicture {
  height: 250px;
}
.infoSection {
  margin-top: 30px;
  max-width: 500px;
}
.profile {
  margin-top: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.custom-file-upload{
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
}
.deleteButton {
  margin-top: 10px;
}
.infoSection {
  margin-top: 30px;
  max-width: 500px;
}
input[type="file"] {
  display: none;
}
.settings {
  margin-left: 40px;
  margin-top: 20px;
}
</style>
