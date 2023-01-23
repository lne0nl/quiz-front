import type { Team } from "@/interfaces";
import { defineStore } from "pinia";

const teams: Team[] = [];

export const useQuizStore = defineStore("quiz", {
  state: () => ({
    teams: teams,
    disableBuzzers: false,
  }),
});
