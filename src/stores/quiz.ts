import { defineStore } from "pinia";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACK_URL, {
  autoConnect: false,
});

// later
// socket.on("close", () => {
//   socket.disconnect();
// });

export interface Team {
  name: string;
  score: number;
  active: boolean;
  connected: boolean;
}

const teams: Team[] = [];

export const useQuizStore = defineStore("quiz", {
  state: () => ({
    teams: teams,
  }),
  actions: {
    addTeam(team: Team) {
      socket.connect();
      team.connected = true;
      socket.emit("add-team", team);
    },
    buzz(teamName: string) {
      socket.emit("buzz", teamName);
    },
  },
});
