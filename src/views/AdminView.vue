<script setup lang="ts">
import type { Team } from "@/interfaces";
import { io } from "socket.io-client";
import { ref, type Ref } from "vue";
const socket = io(import.meta.env.VITE_BACK_URL);

let teams: Ref<Team[]> = ref([]);
let quizName: Ref<string> = ref("");

socket.on("raz", () => {
  teams.value = [];
  quizName.value = "";
});

socket.on("team-added", (teamsArray: Team[]) => {
  teams.value = teamsArray;
});

socket.on("remove-team", (teamName: string) => {
  console.log("prout");
  let index = 0;
  teams.value.find((o: Team) => {
    if (o.name === teamName) {
      index = teams.value.indexOf(o);
    }
  });
  teams.value.splice(index, 1);
});

socket.on("buzz-win", (winningTeam) => {
  teams.value.find((o: Team) => {
    if (o.name === winningTeam) o.active = true;
  });
});

const validateName = (e: Event) => {
  e.preventDefault();
  socket.emit("quiz-name", quizName.value);
};

const addPoint = (teamName: string) => {
  socket.emit("add-point", teamName);
  teams.value.find((o: Team) => {
    if (o.name === teamName) o.score += 1;
  });
};

const removePoint = (teamName: string) => {
  socket.emit("remove-point", teamName);
  teams.value.find((o: Team) => {
    if (o.name === teamName) o.score -= 1;
  });
};

const razBuzz = () => {
  socket.emit("raz-buzz");
  teams.value.find((o: Team) => {
    if (o.active === true) o.active = false;
  });
};

const raz = () => {
  socket.emit("raz");
};
</script>

<template>
  <form class="quizz-name" @submit="validateName">
    <input type="text" v-model="quizName" />
    <button type="submit">Valider</button>
  </form>
  Liste des équipes
  <ul v-if="teams.length">
    <li v-for="team in teams" :key="team.name">
      <div :class="{ active: team.active }">{{ team.name }}</div>
      <div class="score">
        {{ team.score }}
        <button @click="removePoint(team.name)">-1</button>
        <button @click="addPoint(team.name)">+1</button>
      </div>
    </li>
  </ul>

  <button @click="razBuzz">Réinitialiser les buzzers</button>
  <button @click="raz">Réinitialiser le quiz</button>
</template>

<style lang="scss">
.active {
  background-color: green;
  color: white;
}
</style>
