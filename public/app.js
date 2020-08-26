const ws = new WebSocket(`ws://localhost:3001/ws`);

console.log(ws)

ws.onopen = () => {
  console.log("ws opened")
  ws.send(JSON.stringify({ join: true }))
}

ws.onmessage = (message) => {
  console.log(message)
  const data = JSON.parse(message.data);
  console.log({ data })
  if (data.rapid_wind) {
    const [time, mps, dir] = data.rapid_wind[data.rapid_wind.length - 1]
    document.getElementById('time').innerHTML = time;
    document.getElementById('mps').innerHTML = mps;
    document.getElementById('dir').innerHTML = dir;
  }
}