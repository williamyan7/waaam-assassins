<template lang="html">
  <div class="signup">
    <form class="card-panel" @submit.prevent="signup" enctype="multipart/form-data">
      <h2 class="center red-text">Signup</h2>
      <div class="field">
        <label for="name" class="label">Name:</label>
        <input type="text" name="name" v-model="name">
      </div>
      <div class="field">
        <label for="email" class="label">Email:</label>
        <input type="email" name="email" v-model="email">
      </div>
      <div class="field">
        <label for="code_name" class="label">Code Name:</label><span @click="generateRandomName" class="random">Generate Random</span>
        <input type="text" name="code_name" v-model="code_name">
      </div>
      <div>
        <label for="uploadedImage" class="custom-file-upload grey-text text-darken-2">Upload Profile Photo
        <input class="photoInput" type="file" value="upload" id="uploadedImage" accept="image/*" @change="storeImageLocal">
        </label>
        <br>This picture will be used by opposing teams to identify you. You can upload
        any picture of yourself. The only caveat is it should be possible to tell that
        it is you (e.g. no baby pictures or highly obscured pictures).
      </div>
      <br>
      <div class="field">
        <label for="password" class="label">Password:</label>
        <input type="password" name="password" v-model="password">
      </div>
      <div class="field">
        <label for="confirmPassword" class="label">Confirm Password:</label>
        <input type="password" name="confirmPassword" v-model="confirmPassword">
      </div>
      <div class="field">
        <v-flex>
          <v-select
           :items="dynasties"
           label="Select your dynasty"
           v-model="dynasty"
           ></v-select>
         </v-flex>
      </div>
      <p class="red-text center" v-if="feedback">{{ feedback }}</p>
      <div class="field center">
        <button class="btn red">Signup</button>
      </div>
    </form>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  name: 'Signup',
  data() {
    return {
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
      feedback: null,
      code_name: null,
      dynasty: null,
      photo: null,
      existing_code_names: [],
      kill_code: 'Generated when game starts',
      dynasties: ['Fire', 'Water', 'Earth', 'Air']
    }
  },
  methods: {
    signup() {
      var self = this
      const ref = firebase.firestore().collection('users')
      var code_name_available = this.checkCodeNameAvailability()
      if(this.name && this.email && this.password && this.code_name && this.photo){
        if(code_name_available) {
          if(this.password == this.confirmPassword) {
            firebase.auth().createUserWithEmailAndPassword(this.email,this.password)
            .then(() => {
              console.log(this.kill_code)
              ref.doc(this.email).set({
                name: this.name,
                email: this.email,
                dynasty: this.dynasty,
                code_name: this.code_name,
                uploadedPhoto: true,
                team_number: null,
                target_team_number: null,
                num_kills: 0,
                days_since_last_kill: 0,
                kill_code: this.kill_code,
                status: 'Alive'
              })
            })
            .then(() => {
                this.uploadImage()
                firebase.auth().currentUser.sendEmailVerification()})
            .then(() => {this.$router.push({ name: 'VerifyEmail' })})
              .catch(err => {
                console.log(err)
                this.feedback = err.message})
              }
           else {
            this.feedback = 'Passwords do not match.'
          }
        } else {
          this.feedback = 'Code name is taken, please try another one.'
        }
      } else {
        this.feedback = 'Please complete all fields.'
      }
    },
    storeImageLocal(event) {
      this.photo = event.target.files
      console.log('storing locally')
      console.log(this.photo)
    },
    uploadImage() {
      var self = this
      firebase.storage().ref().child(this.email).put(this.photo[0])
      .then(() => {
        //Get image URL
        firebase.storage().ref().child(this.email)
        .getDownloadURL().then(function(url) {
        self.imageURL = url
        self.hasImage = true
        firebase.firestore().collection('users').doc(this.email)
        .update({
          uploadedPhoto: true,
          imageURL: url
        })
        }).catch(err => console.log(err))
      })
    },
    generateRandomName() {
      var random_nouns = []
      var random_adj = []
      firebase.firestore().collection('code_names').doc('random_adj').get()
      .then(doc => {
        random_adj = doc.data().adj_list
        firebase.firestore().collection('code_names').doc('random_nouns').get()
        .then(doc => {
          random_nouns = doc.data().noun_list
          var adj = random_adj[Math.floor(Math.random() * random_adj.length)]
          var noun = random_nouns[Math.floor(Math.random() * random_nouns.length)]
          this.code_name = adj + " " + noun
        })
      })
    },
    checkCodeNameAvailability() {
      return !(this.existing_code_names.indexOf(this.code_name.toLowerCase()) > -1)
    }
  },
  created() {
    var self = this
    firebase.firestore().collection('users').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        self.existing_code_names.push(doc.data().code_name.toLowerCase())
      })
    })
  }
}
</script>

<style lang="css">
.random {
  border-style: solid;
  border-width: 1px;
  margin-left: 10px;
  cursor: pointer;
  padding: 5px;
  color: red;
  border-color: red;
}
.signup {
  margin-top: 40px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.signup h2{
  font-size: 2.4em;
}
.signup .field {
  margin-bottom: 16px
}
.label {
  font-size: 1em;
}
</style>
