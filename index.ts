import { config, WebSocket } from "./deps.ts";
import { WfData, WfMessageObj } from "./types.d.ts";
const ENV = config();

console.log(ENV);

const endpoint =
  `wss://ws.weatherflow.com/swd/data?api_key=${ENV.WEATHERFLOW_API_KEY}`;

let data: WfData = {
  summary: {},
  rapid_wind: [],
  obs_st: [],
};

let jsonText = JSON.stringify(data);

try {
  jsonText = await Deno.readTextFile("data.json");
} catch (e) {
  console.log("data.json did not exist");
}

data = JSON.parse(jsonText);

console.log(data);

const ws: WebSocket = new WebSocket(endpoint);

ws.on("open", function () {
  console.log("ws connected!");
  sendStartRequests();
});

ws.on("message", async function (message: string) {
  const messageObj: WfMessageObj = JSON.parse(message);
  console.log(messageObj);
  switch (messageObj.type) {
    case "rapid_wind":
      data.rapid_wind.push(messageObj.ob);
      break;
    case "obs_st":
      data.obs_st.push(messageObj.obs[0]);
      data.summary = messageObj.summary;
    default:
      break;
  }
  await Deno.writeTextFile("data.json", JSON.stringify(data));
});

const sendStartRequests = (): void => {
  ws.send(
    `{ "type":"listen_rapid_start", "device_id":77988, "id":"${
      Math.round(Math.random() * 1000000000)
    }" }`,
  );
  ws.send(
    `{ "type":"listen_start", "device_id":77988, "id":"${
      Math.round(Math.random() * 1000000000)
    }" }`,
  );
};
