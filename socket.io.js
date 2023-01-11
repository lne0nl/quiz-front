const io = "socket.io/socket.io.js";

export const useSocketIO = () => {
  const socket = io("https://quiz-3csv.onrender.com");
  return { socket };
};
