<script setup lang="ts">
import type { Team } from "@/interfaces";
import { io } from "socket.io-client";
import { ref, type Ref } from "vue";
const socket = io(import.meta.env.VITE_BACK_URL);

let teams: Ref<Team[]> = ref([]);

socket.on("team-added", (teamsArray: Team[]) => (teams.value = teamsArray));

socket.on("buzz-win", (winningTeam) => {
  teams.value.find((o: Team) => {
    if (o.name === winningTeam) o.active = true;
  });
});

const razBuzz = () => {
  socket.emit("raz-buzz");

  teams.value.find((o: Team) => {
    if (o.active === true) o.active = false;
  });
};
</script>

<template>
  Liste des équipes
  <ul v-if="teams.length">
    <li v-for="team in teams" :key="team.name">
      <span :class="{ active: team.active }">{{ team.name }}</span>
    </li>
  </ul>

  <button @click="razBuzz">RAZ</button>
</template>

<style lang="scss">
.active {
  background-color: green;
  color: white;
}
</style>
