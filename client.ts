import { WebSocket } from "./deps.ts";

const endpoint = "ws://localhost:3001/ws";

const wsClient: WebSocket = new WebSocket(endpoint);

wsClient.on("open", () => {
  console.log("wsClient connected!");
  wsClient.send(`{"join":true}`);
});

wsClient.on("message", (message: string) => {
  console.log(message);
});

wsClient.on("close", () => {
  console.log("closing socket");
});
