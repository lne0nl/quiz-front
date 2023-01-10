<script setup lang="ts">
import { useQuizStore } from "@/stores/quiz";
import { storeToRefs } from "pinia";
import { io } from "socket.io-client";
const socket = io("http://localhost:8080");
const store = useQuizStore();
const { teams } = storeToRefs(store);

socket.on("team-added", (teamsArray) => {
  store.teams = teamsArray;
});

socket.on("buzz-win", (winningTeam) => {
  teams.value.find((o, i) => {
    if (o.name === winningTeam) teams.value[i].active = true;
  });
  console.log(winningTeam);
  console.log(teams.value);
});
</script>

<template>
  Liste des équipes
  <ul v-if="teams">
    <li v-for="team in teams" :key="team.name">
      <span v-if="team.active" class="active">{{ team.name }}</span>
      <span v-if="!team.active">{{ team.name }}</span>
    </li>
  </ul>
</template>

<style lang="scss">
.active {
  background-color: green;
  color: white;
}
</style>
