<script setup lang="ts">
import { useQuizStore } from "@/stores/quiz";
import { storeToRefs } from "pinia";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACK_URL);
const store = useQuizStore();
const { teams } = storeToRefs(store);

socket.on("team-added", (teamsArray) => {
  store.teams = teamsArray;
});
</script>
<template>
  Zeniquiz
  <ul v-if="teams">
    <li v-for="team in teams" :key="team.name">
      {{ team.name }}
    </li>
  </ul>
</template>
