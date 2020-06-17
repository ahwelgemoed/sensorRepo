import WebSocket from 'ws';
import sensor from 'node-dht-sensor';

const asyncSensor = sensor.promises;

const ws = new WebSocket('ws://10.0.0.126:8080');

async function exec() {
  try {
    const res = await asyncSensor.read(22, 4);
    ws.on('open', () => {
      ws.send([res]);
    });
  } catch (err) {
    console.error('Failed to read sensor data:', err);
  }
}

exec();

ws.on('message', function incoming(data) {
  console.log(data);
});
