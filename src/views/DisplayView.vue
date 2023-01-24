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

socket.on("quiz-name", (name: string) => {
  quizName.value = name;
});

socket.on("title", (name: string) => {
  quizName.value = name;
});

socket.on("team-added", (teamsArray: Team[]) => {
  teams.value = teamsArray;
});

socket.on("remove-team", (teamName: string) => {
  let index = -1;
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

socket.on("raz-buzz", () => {
  teams.value.find((o: Team) => {
    if (o.active === true) o.active = false;
  });
});

socket.on("add-point", (teamName) => {
  teams.value.find((o: Team) => {
    if (o.name === teamName) o.score += 1;
  });
});

socket.on("remove-point", (teamName) => {
  teams.value.find((o: Team) => {
    if (o.name === teamName) o.score -= 1;
  });
});
</script>

<template>
  <h1 class="quiz-name">{{ quizName }}</h1>
  <ul v-if="teams.length" class="teams-list">
    <li v-for="team in teams" :key="team.name" class="team">
      <div class="team-name" :class="{ active: team.active }">
        {{ team.name }}
      </div>
      <div class="team-score">{{ team.score }}</div>
    </li>
  </ul>
</template>

<style lang="scss">
.quiz-name {
  text-align: center;
  font-size: 100px;
  margin-top: 0;
  background: linear-gradient(51.05deg, #ee2238 -57.1%, #bf1d67 156.72%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.teams-list {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  max-height: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  text-align: center;
  transform: translate(-50%, -50%);
}

.team {
  padding: 20px;
  font-size: 60px;

  &-name {
    font-weight: 700;
    padding: 0 15px;
    border-radius: 10px;
  }

  &-score {
    font-size: 40px;
    font-weight: bold;
  }
}

.active {
  background: linear-gradient(51.05deg, #a0ee22 -57.1%, #479116 156.72%);
  color: white;
}
</style>
