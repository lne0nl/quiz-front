import type { Team } from "@/interfaces";
import { defineStore } from "pinia";

// later
// socket.on("close", () => {
//   socket.disconnect();
// });

const teams: Team[] = [];

export const useQuizStore = defineStore("quiz", {
  state: () => ({
    teams: teams,
    disableBuzzers: false,
  }),
});
