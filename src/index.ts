import WebSocket from 'ws';
import sensor from 'node-dht-sensor';
import { setInterval } from 'timers';

const asyncSensor = sensor.promises;

const ws = new WebSocket('ws://10.0.0.126:8080');

ws.on('open', function open() {
  ws.send('Im Online');
  setInterval(() => {
    sentTempToSocket();
  }, 5000);
});

interface SensorValues extends Promise<void> {
  temperature: string;
  humidity: string;
}

const getTemp = async () => {
  try {
    const res = await asyncSensor.read(22, 4);
    return res;
  } catch (err) {
    const x = JSON.stringify(err);
    await ws.send(x);
    console.error('Failed to read sensor data:', err);
  }
};
const sentTempToSocket = async () => {
  const res = await getTemp();
  console.log('res', res);
  const x = JSON.stringify(res);
  await ws.send(x);
};

ws.on('message', function incoming(data) {
  console.log(data);
});
