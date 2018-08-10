<template>
  <v-container fluid>
  <v-layout row wrap>
    <v-flex xs12 class="text-xs-center" mt-5>
      <h2>Welcome to WAAAM Assassins</h2>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 mt-3>
      <p class="blockquote text-xs-center">
        This is where you'll find all the information you need on WAAAM Assassins
      </p>
    </v-flex>
    <v-flex xs12 sm6 offset-sm3 class="text-xs-center" mt-3>
      <v-btn color="red darken-2 white--text" to="/signup">Sign Up</v-btn>
      <v-btn to="/login">Login</v-btn>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
  name: 'LandingPage',
  data () {
    return {

    }
  }
}
</script>

<style scoped>

</style>
