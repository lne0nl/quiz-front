<script setup lang="ts">
import { ref, type Ref } from "vue";
import { io } from "socket.io-client";
import type { Team } from "@/interfaces";
import { useRoute } from "vue-router";

const socket = io(import.meta.env.VITE_BACK_URL, {
  autoConnect: false,
});
const route = useRoute();
const quizID = route.params.id;

let teamName: Ref<string> = ref("");
let connected: Ref<boolean> = ref(false);
let disableBuzzer: Ref<boolean> = ref(true);
let winner: Ref<boolean> = ref(false);
let error: Ref<string> = ref("");
let finished: Ref<boolean> = ref(false);

if (!quizID) {
  error.value = "Ce quiz n'existe pas";
} else {
  socket.connect();
  socket.emit("check-quiz", quizID);
}

socket.on("check-quiz", (quiz) => {
  if (!quiz) {
    error.value = "Ce quiz n'existe pas";
    socket.disconnect();
  }
});

socket.on("toggle-buzz", (active) => (disableBuzzer.value = !active));

const fillTeamName = (e: Event) =>
  (teamName.value = (e.target as HTMLInputElement).value);

socket.on("quiz-started", () => (disableBuzzer.value = false));

socket.on("buzz-win", (winningTeam: string) => {
  disableBuzzer.value = true;

  if (teamName.value === winningTeam) winner.value = true;
});

socket.on("raz-buzz", () => {
  disableBuzzer.value = false;
  winner.value = false;
});

socket.on("close", () => socket.disconnect());

socket.on("disconnect", () => {
  finished.value = true;
});

socket.on("disconnect", () => (connected.value = false));

const buzz = () => socket.emit("buzz", teamName.value, quizID);

const signIn = (e: Event) => {
  e.preventDefault();
  if (teamName.value) {
    const team: Team = {
      name: teamName.value,
      score: 0,
      active: false,
    };
    connected.value = true;
    socket.connect();
    socket.emit("add-team", quizID, team, "user");
  }
};
</script>

<template>
  <div>
    <div v-if="error" class="error">
      {{ error }}
    </div>
    <div v-if="finished && !error" class="finished">
      Le quiz est terminé, merci pour votre participation !
    </div>
    <div v-if="!error && !finished">
      <div v-if="!connected" class="sign-in-wrapper">
        <form @submit="signIn" class="sign-in-form">
          <div class="sign-in-todo">Choisissez un nom d'équipe</div>
          <input
            type="text"
            class="sign-in-input"
            placeholder="Nom d'équipe"
            autofocus
            v-model="teamName"
            @keyup="fillTeamName"
          />
          <button class="sign-in-button" type="submit">Valider</button>
        </form>
      </div>

      <div v-if="connected && !finished" class="buzz-wrapper">
        <button
          :disabled="disableBuzzer"
          class="buzz-button"
          :class="{ 'buzz-button-winner': winner }"
          @click="buzz"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sign-in {
  &-wrapper {
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 20px;
    right: 20px;
  }

  &-form {
    position: inherit;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
  }

  &-todo {
    text-align: center;
    margin-bottom: 10px;
    font-size: 30px;
    font-weight: 700;
  }

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

.buzz {
  &-wrapper {
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 20px;
    right: 20px;
  }

  &-button {
    position: inherit;
    top: 50%;
    left: 50%;
    width: 270px;
    height: 270px;

    border: 3px solid #fff;
    background: #e53030;
    box-shadow: 0 -10px 0 3px darken(#e53030, 10%) inset,
      0 10px 10px rgba(darken(#e53030, 40%), 0.17),
      0 30px rgba(#fff, 0.25) inset;
    border-radius: 50%;
    transform: translate(-50%, -50%);

    &:disabled {
      background: gray;
      box-shadow: 0 -10px 0 3px darken(gray, 10%) inset,
        0 10px 10px rgba(darken(gray, 40%), 0.17), 0 30px rgba(#fff, 0.25) inset;
    }

    &-winner {
      background: #78c200;
      box-shadow: 0 -10px 0 3px darken(#78c200, 10%) inset,
        0 10px 10px rgba(darken(#78c200, 40%), 0.17),
        0 30px rgba(#fff, 0.25) inset;

      &:disabled {
        background: #78c200;
        box-shadow: 0 -10px 0 3px darken(#78c200, 10%) inset,
          0 10px 10px rgba(darken(#78c200, 40%), 0.17),
          0 30px rgba(#fff, 0.25) inset;
      }
    }
  }
}

.finished,
.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  font-size: 60px;
  text-align: center;
}
</style>
