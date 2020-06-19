import WebSocket from 'ws';
import sensor from 'node-dht-sensor';
import ReconnectingWebSocket from 'reconnecting-websocket';

const asyncSensor = sensor.promises;

const options = {
  WebSocket: WebSocket, // custom WebSocket constructor
  connectionTimeout: 5000,
  maxRetries: 100,
};

const ws = new ReconnectingWebSocket('ws://10.0.0.126:8080', [], options);

let interval;

const openSocket = () => {
  ws.addEventListener('open', function connection(ws) {
    setInterval(() => {
      sentTempToSocket();
    }, 60000);
  });
};

const getTemp = async () => {
  try {
    const res = await asyncSensor.read(22, 4);
    return res;
  } catch (err) {
    const x = JSON.stringify(err);

    console.error('Failed to read sensor data:', err);
  }
};
const sentTempToSocket = async () => {
  clearInterval(interval);
  const res = await getTemp();
  const x = JSON.stringify(res);
  await ws.send(x);
};

ws.addEventListener('message', function incoming(data) {
  console.log(data);
});

ws.addEventListener('close', function close() {
  console.log('🔥-Closed');
});

openSocket();
