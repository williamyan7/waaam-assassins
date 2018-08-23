<template lang="html">
  <div>
    <h2>Admin page</h2>
    <button class="btn red" @click="generateKillCodeList">Generate Kill Codes</button>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data () {
    return {

    }
  },
  methods: {
    generateKillCodeList(){
      var code_list = []
      var words1 = ['gigantic', 'humongous', 'ridiculous', 'precious', 'insatiable',
      'prickly', 'dubious', 'cranky', 'crafty', 'crazy', 'minty', 'fresh', 'sparkly', 'belching',
      'auspicious', 'striking', 'pretentious']
      var words2 = ['computer', 'bottle', 'pony', 'wallet', 'defibrilator', 'headlight', 'freshman',
      'clipper', 'direwolf', 'methane', 'universe', 'timetravel', 'shipwreck', 'vitamin', 'baller',
      'asian', 'domino', 'fireball', 'yoga']
      for(var i=0; i<words1.length; i++) {
        var word1 = words1[i]
        for(var j=0; j<words2.length; j++) {
          var word2 = words2[j]
          var code = word1+word2
          code_list.push(code)
        }
      }
      this.shuffleArray(code_list)
      console.log(code_list)
      firebase.firestore().collection('kill_codes').doc("existing_kill_codes").set(
        {codes_list: code_list})
    },
    shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
  }
}
}
</script>

<style lang="css">
</style>
