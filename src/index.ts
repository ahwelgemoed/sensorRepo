import WebSocket from 'ws';
import sensor from 'node-dht-sensor';

const asyncSensor = sensor.promises;

interface SensorValues extends Promise<void> {
  temperature: string;
  humidity: string;
}

const ws = new WebSocket('ws://10.0.0.126:8080');
let closeInterval;
const openSocket = () => {
  ws.on('open', function open() {
    closeInterval = setInterval(() => {
      sentTempToSocket();
    }, 5000);
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
  const res = await getTemp();
  const x = JSON.stringify(res);
  await ws.send(x);
};

ws.on('message', function incoming(data) {
  console.log(data);
});

ws.on('close', function close() {
  clearInterval(closeInterval);
  setTimeout(() => {
    openSocket();
  }, 5000);
});

const check = () => {
  if (!ws || ws.readyState == 3) openSocket();
};
setInterval(check, 5000);
openSocket();
