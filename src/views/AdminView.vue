<script setup lang="ts">
import type { Quiz, Team } from "@/types";
import { io } from "socket.io-client";
import { ref, type Ref } from "vue";
import { nanoid } from "nanoid";
import CopyPasteIcon from "@/assets/images/copy-icon.svg?component";
import { useRoute } from "vue-router";
import router from "@/router";
import Button from "@/components/ButtonComponent.vue";

const socket = io(import.meta.env.VITE_BACK_URL, {
  autoConnect: false,
});
const route = useRoute();

let teams: Ref<Team[]> = ref([]);
let quizName: Ref<string> = ref("");
let winningTeam: Ref<string> = ref("");
let created: Ref<boolean> = ref(false);
let displayURL: Ref<string> = ref("");
let started: Ref<boolean> = ref(false);
let quizID: string | string[] = route.params.id || "";
let showQR: Ref<boolean> = ref(false);
let showTeams: Ref<boolean> = ref(false);
let activeBuzz: Ref<boolean> = ref(false);

if (quizID) {
  socket.connect();
  socket.emit("check-quiz", quizID, false);
}

const origin = window.location.origin;
const pathname = window.location.pathname;
const URL = `${origin}${pathname}${quizID}`;

socket.on("check-quiz", (quiz: Quiz) => {
  if (quiz) {
    started.value = quiz.started;
    created.value = true;
    quizName.value = quiz.name;
    displayURL.value = `${origin}${pathname}#/display/${quizID}`;
    teams.value = quiz.teams;
  } else {
    router.push({ name: "admin" });
  }
});

const createQuiz = (e: Event) => {
  e.preventDefault();
  quizID = nanoid(5);
  socket.connect();
  socket.emit("create", { id: quizID, name: quizName.value });
  router.push({ path: `/admin/${quizID}` });
  displayURL.value = `${URL}#/display/${quizID}`;
  created.value = true;
};

const copyURL = () => navigator.clipboard.writeText(displayURL.value);

const startQuiz = () => {
  started.value = true;
  socket.emit("start-quiz", quizID);
};

const toggleQRCode = () => {
  socket.emit("show-code", quizID);
  showQR.value = !showQR.value;
};

socket.on("raz", () => {
  teams.value = [];
  quizName.value = "";
});

socket.on("title", (name: string) => (quizName.value = name));

socket.on("team-added", (teamsArray: Team[]) => (teams.value = teamsArray));

socket.on("remove-team", (teamName: string) => {
  let index = -1;
  teams.value.find((o: Team) => {
    if (o.name === teamName) {
      index = teams.value.indexOf(o);
    }
  });
  teams.value.splice(index, 1);
});

socket.on("buzz-win", (fastestTeam: Team) => {
  winningTeam.value = fastestTeam.name;
  teams.value.find((team: Team) => {
    if (team.id === fastestTeam.id) team.active = true;
  });
});

const addPoint = (e: Event) => {
  const origin = (e.target as HTMLInputElement).dataset.origin;
  socket.emit("add-point", quizID, (e.target as HTMLInputElement).dataset.name);
  if (winningTeam.value) winningTeam.value = "";
  if (origin && origin === "win") {
    socket.emit("win", quizID);
  }
  razBuzz(e);
};

socket.on("add-point", (teamsArray: Team[]) => (teams.value = teamsArray));

const removePoint = (e: Event) =>
  socket.emit(
    "remove-point",
    quizID,
    (e.target as HTMLInputElement).dataset.name
  );

socket.on("remove-point", (teamsArray: Team[]) => (teams.value = teamsArray));

const razBuzz = (e: Event) => {
  const origin = (e.target as HTMLInputElement).dataset.origin;
  if (origin && origin === "lose") socket.emit("lose", quizID);
  socket.emit("raz-buzz", quizID);
  winningTeam.value = "";
};

const raz = () => socket.emit("raz", quizID);

const toggleBuzz = (active: boolean) => {
  activeBuzz.value = active;
  socket.emit("toggle-buzz", quizID, activeBuzz.value);
};

const toggleTeams = () => (showTeams.value = !showTeams.value);

socket.on("disconnect", () => {
  created.value = false;
  started.value = false;
  teams.value = [];
  quizName.value = "";
  winningTeam.value = "";
  displayURL.value = "";
  showQR.value = false;
  showTeams.value = false;
  activeBuzz.value = false;
  router.push({ name: "admin" });
});
</script>

<template>
  <form v-if="!created && !started" class="quiz-name-form" @submit="createQuiz">
    <input
      type="text"
      class="quiz-name-input"
      :placeholder="$t('message.admin.quiz.name')"
      autofocus
      v-model="quizName"
    />
    <Button>
      {{ $t("message.admin.quiz.create") }}
    </Button>
  </form>

  <div v-if="created && !started">
    <div class="share-display">
      <h2>{{ $t("message.admin.quiz.screen", { quizName }) }}</h2>
      <a :href="displayURL" target="_blank">{{ displayURL }}</a>
      <button class="copy-paste-button" type="button" @click="copyURL">
        <CopyPasteIcon />
      </button>
      <Button @click="startQuiz">{{ $t("message.admin.quiz.start") }}</Button>
    </div>
  </div>

  <div v-if="showTeams && teams.length">
    <button class="close-button" @click="toggleTeams">X</button>
    <ul class="teams-list">
      <li v-for="team in teams" :key="team.name" class="team">
        <div class="team-name">{{ team.name }}</div>
        <div class="team-score">{{ team.score }}</div>
        <button
          class="team-button"
          type="button"
          @click="removePoint"
          :data-name="team.name"
        >
          -
        </button>
        <button
          class="team-button"
          type="button"
          @click="addPoint"
          :data-name="team.name"
        >
          +
        </button>
      </li>
    </ul>
  </div>

  <div v-if="created">
    <div class="quiz-tools">
      <div v-if="started">
        <Button @click="toggleBuzz(true)">Buzzers ON</Button>
        <Button @click="toggleBuzz(false)">Buzzers OFF</Button>
      </div>
      <Button v-if="started" @click="toggleQRCode">
        {{
          showQR
            ? $t("message.admin.hide.code")
            : $t("message.admin.display.code")
        }}
      </Button>
      <Button v-if="started && teams.length" @click="toggleTeams">{{
        $t("message.admin.display.teams")
      }}</Button>
      <Button @click="raz">{{ $t("message.admin.quiz.delete") }}</Button>
    </div>
  </div>

  <div v-if="started" class="quiz-name">
    {{ quizName }}
  </div>

  <div v-if="winningTeam && started" class="quiz-winner">
    <div class="quiz-winner-name">
      {{ winningTeam }}
    </div>
    <div class="quiz-winner-buttons">
      <button @click="razBuzz" data-origin="lose" class="quiz-winner-button no">
        ❌
      </button>
      <button
        @click="addPoint"
        :data-name="winningTeam"
        data-origin="win"
        class="quiz-winner-button yes"
      >
        ✔
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.active {
  background-color: green;
  color: white;
}

.quiz-name {
  text-align: center;
  font-size: 60px;
  margin-top: 0;
  background: linear-gradient(51.05deg, #ee2238 -57.1%, #bf1d67 156.72%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;

  &-input {
    width: 100%;
    height: 50px;
    font-size: 30px;
    padding: 30px 10px;
    text-align: center;
    color: white;
    background-color: rgba(255, 255, 255, 0.4);
    border: 2px solid white;
    border-radius: 10px;
    font-weight: 700;

    &::-webkit-input-placeholder {
      color: rgba(255, 255, 255, 0.527);
    }
  }
}

.quiz-winner {
  position: absolute;
  left: 50%;
  top: 40%;
  width: 100%;
  transform: translate(-50%, -50%);

  &-name {
    text-align: center;
    font-weight: 700;
    font-size: 60px;
    background: linear-gradient(51.05deg, #a0ee22 -57.1%, #479116 156.72%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }

  &-buttons {
    display: flex;
    margin-top: 20px;
    justify-content: space-around;
    align-items: center;
  }

  &-button {
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    border: 2px solid white;
    height: 80px;
    width: 80px;
    border-radius: 100%;
    padding: 0;

    &.yes {
      font-size: 80px;
      background: linear-gradient(51.05deg, #a0ee22 -57.1%, #479116 156.72%);
      background-clip: text;
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
    }

    &.no {
      font-size: 45px;
      color: red;
    }
  }
}

.share-display {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  font-size: 24px;
  font-weight: 700;
  transform: translate(-50%, -50%);
}

.copy-paste-button {
  width: 30px;
  height: 30px;
  margin-left: 10px;
  background: transparent;
  border: none;
  margin-top: 10px;
  cursor: pointer;
}

.quiz-tools {
  position: absolute;
  bottom: 10px;
  left: 50%;
  width: 80%;
  transform: translateX(-50%);
}

.teams-list {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 50px;
  font-size: 30px;
  background-color: black;
  z-index: 1;
}

.team {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  &-name {
    font-weight: 700;
  }

  &-score {
    margin-left: 20px;
    margin-right: 20px;
  }

  &-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: 10px;
    width: 40px;
    height: 40px;
    border: 2px solid white;
    border-radius: 100%;
    background: transparent;
    color: white;
    font-weight: 700;
    font-size: 30px;
  }
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  border: none;
  color: white;
  background: transparent;
  font-weight: 700;
  font-size: 30px;
}
</style>
