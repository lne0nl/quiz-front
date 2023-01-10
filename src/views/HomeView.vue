<script setup lang="ts">
import { ref } from "vue";
import { useQuizStore } from "@/stores/quiz";

const store = useQuizStore();

let teamName = ref("");
let connected = ref(false);

const fillTeamName = (e: Event) => {
  teamName.value = (e.target as HTMLInputElement).value;
};

const buzz = () => {
  store.buzz(teamName.value);
};

const signIn = (e: Event) => {
  e.preventDefault();
  store.addTeam({
    name: teamName.value,
    score: 0,
    active: false,
    connected: false,
  });
  connected.value = true;
};
</script>

<template>
  <div v-if="!connected" class="sign-in-wrapper">
    <form @submit="signIn" class="sign-in-form">
      <input
        type="text"
        class="sign-in-input"
        placeholder="Nom d'équipe"
        v-model="teamName"
        @keyup="fillTeamName"
      />
      <button class="sign-in-button" type="submit">S'inscrire</button>
    </form>
  </div>

  <div v-if="connected" class="buzz-wrapper">
    <button class="buzz-button" @click="buzz">BUZZ !</button>
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

  &-input {
    width: 100%;
    height: 50px;
    font-size: 30px;
    padding: 10px;
    text-align: center;
  }

  &-button {
    width: 100%;
    height: 40px;
    margin-top: 10px;
    font-size: 30px;
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
    width: 250px;
    height: 250px;
    background: transparent;
    background-color: rgb(155, 45, 45);
    border: 10px solid black;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    font-size: 50px;
    font-weight: 700;

    &:active {
      background-color: rgb(97, 27, 27);
      color: white;
    }
  }
}
</style>
