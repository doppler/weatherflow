import {
  config,
  v4,
  WebSocket,
} from "./deps.ts";
import { WfData, WfMessageObj } from "./types.d.ts";
const ENV = config();

// used to truncate data length
const MAX_RAPID_WIND_ENTRIES = 60 * 5 / 3;
const MAX_OBS_ST_ENTRIES = 5;

const endpoint =
  `wss://ws.weatherflow.com/swd/data?api_key=${ENV.WEATHERFLOW_API_KEY}`;

const clientsMap = new Map();

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

const sendMessage = (message: any) => {
  clientsMap.forEach((client) => {
    try {
      client.ws.send(JSON.stringify(message));
    } catch (e) {
      console.log(`client gone. removing ${client.clientId}`);
      clientsMap.delete(client.clientId);
    }
  });
};
const wsClient: WebSocket = new WebSocket(endpoint);

wsClient.on("open", function () {
  console.log("wsClient connected!");
  sendStartRequests();
});

wsClient.on("message", async function (message: string) {
  const messageObj: WfMessageObj = JSON.parse(message);
  console.log(messageObj);
  switch (messageObj.type) {
    case "rapid_wind":
      data.rapid_wind.push(messageObj.ob);
      data.rapid_wind.length > MAX_RAPID_WIND_ENTRIES &&
        data.rapid_wind.shift();
      sendMessage({ rapid_wind: data.rapid_wind });
      break;
    case "obs_st":
      data.obs_st.push(messageObj.obs[0]);
      data.obs_st.length > MAX_OBS_ST_ENTRIES && data.obs_st.shift();
      sendMessage({ obs_st: data.obs_st });
      data.summary = messageObj.summary;
      sendMessage({ summary: data.summary });
    default:
      break;
  }
  await Deno.writeTextFile("data.json", JSON.stringify(data));
});

const sendStartRequests = (): void => {
  const device_id = ENV.WEATHERFLOW_DEVICE_ID;
  wsClient.send(JSON.stringify({
    device_id,
    type: "listen_rapid_start",
    id: v4.generate(),
  }));
  wsClient.send(JSON.stringify({
    device_id,
    type: "listen_start",
    id: v4.generate(),
  }));
};

export const handleWs = async (ws: any) => {
  let clientId = v4.generate();

  for await (let message of ws) {
    const event = typeof message === "string" ? JSON.parse(message) : message;
    console.log(message);
    if (event.join) {
      console.log(`adding ${clientId}`);
      clientsMap.set(clientId, {
        clientId,
        ws,
      });
      const { summary, obs_st, rapid_wind } = data;
      sendMessage({ summary, obs_st, rapid_wind });
    }
  }
};
