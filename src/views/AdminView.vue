<script setup lang="ts">
import type { Team } from "@/interfaces";
import { io } from "socket.io-client";
import { ref, type Ref } from "vue";
import { nanoid } from "nanoid";
import CopyPasteIcon from "@/assets/images/copy-icon.svg?component";
// import { useRoute } from "vue-router";

const socket = io(import.meta.env.VITE_BACK_URL, {
  autoConnect: false,
});
// const route = useRoute();
// const quizID = route.params.id;

let teams: Ref<Team[]> = ref([]);
let quizName: Ref<string> = ref("");
let winningTeam: Ref<string> = ref("");
let created: Ref<boolean> = ref(false);
let displayURL: Ref<string> = ref("");
let started: Ref<boolean> = ref(false);
let quizID: string = "";
let showQR: Ref<boolean> = ref(false);

const origin = window.location.origin;
const pathname = window.location.pathname;
const URL = `${origin}${pathname}${quizID}`;

const createQuiz = (e: Event) => {
  e.preventDefault();
  quizID = nanoid(5);
  socket.connect();
  socket.emit("create", { id: quizID, name: quizName.value });
  displayURL.value = `${URL}#/display/${quizID}`;
  created.value = true;
};

const copyURL = () => {
  navigator.clipboard.writeText(displayURL.value);
};

const startQuiz = () => {
  started.value = true;
  socket.emit("start-quiz", quizID, quizName.value);
};

const toggleQRCode = () => {
  socket.emit("show-code", quizID);
  showQR.value = !showQR.value;
};

socket.on("quiz-created", (ID) => {
  console.log(`le quiz ${ID} a bien été créé`);
});

socket.on("join-room", () => {
  console.log("a user has joined the room");
});

socket.on("raz", () => {
  teams.value = [];
  quizName.value = "";
});

socket.on("title", (name: string) => {
  quizName.value = name;
});

socket.on("team-added", (teamsArray: Team[]) => {
  console.table(teamsArray);
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

socket.on("buzz-win", (team) => {
  winningTeam.value = team;
  console.log(team);
  teams.value.find((o: Team) => {
    if (o.name === team) o.active = true;
  });
});

const addPoint = () => {
  socket.emit("add-point", winningTeam.value);
  winningTeam.value = "";
  razBuzz();
};

// const removePoint = (teamName: string) => {
//   socket.emit("remove-point", teamName);
//   teams.value.find((o: Team) => {
//     if (o.name === teamName) o.score -= 1;
//   });
// };

const razBuzz = () => {
  socket.emit("raz-buzz");
  winningTeam.value = "";
};

const raz = () => {
  socket.emit("raz-buzz");
  socket.emit("raz");
};
</script>

<template>
  <form v-if="!created && !started" class="quiz-name-form" @submit="createQuiz">
    <input
      type="text"
      class="quiz-name-input"
      placeholder="Donnez un nom au quiz"
      autofocus
      v-model="quizName"
    />
    <button class="quiz-name-button" type="submit">Valider</button>
  </form>

  <div v-if="created && !started">
    <div class="share-display">
      <h2>{{ quizName }} screen:</h2>
      <a :href="displayURL" target="_blank">{{ displayURL }}</a>
      <button class="copy-paste-button" type="button" @click="copyURL">
        <CopyPasteIcon />
      </button>
      <button class="quiz-name-button" type="button" @click="startQuiz">
        Démarrer le quiz
      </button>
    </div>
  </div>

  <div v-if="created">
    <div class="quiz-tools">
      <button v-if="started" class="quiz-name-button" @click="toggleQRCode">
        {{ showQR ? "Cacher le QR Code" : "Afficher le QR Code" }}
      </button>
      <button class="quiz-name-button" @click="raz">Supprimer le quiz</button>
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
      <button @click="razBuzz" class="quiz-winner-button no">❌</button>
      <button @click="addPoint" class="quiz-winner-button yes">✔</button>
    </div>
  </div>

  <div>
    <!-- <ul v-if="teams.length">
      <li v-for="team in teams" :key="team.name">
        <div :class="{ active: team.active }">{{ team.name }}</div>
        <div class="score">
          {{ team.score }}
          <button @click="removePoint(team.name)">-1</button>
          <button @click="addPoint(team.name)">+1</button>
        </div>
      </li>
    </ul> -->

    <!-- Liste des équipes -->
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

  &-button {
    width: 100%;
    height: 50px;
    margin-top: 20px;
    font-size: 30px;
    font-weight: 700;
    background: linear-gradient(51.05deg, #ee2238 -57.1%, #bf1d67 156.72%);
    border: none;
    border-radius: 10px;
  }
}

.quiz-winner {
  position: absolute;
  left: 50%;
  top: 50%;
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
</style>
