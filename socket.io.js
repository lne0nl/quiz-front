const io = "socket.io/socket.io.js";

export const useSocketIO = () => {
  const socket = io("http://localhost:8080");
  return { socket };
};
