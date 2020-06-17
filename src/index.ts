import WebSocket from 'ws';
import sensor from 'node-dht-sensor';

const asyncSensor = sensor.promises;

const ws = new WebSocket('ws://10.0.0.126:8080');
interface SensorValues extends Promise<void> {
  temperature: string;
  humidity: string;
}
const getTemp = async () => {
  asyncSensor.initialize({
    test: {
      fake: {
        temperature: 21,
        humidity: 60,
      },
    },
  });
  try {
    const res = await asyncSensor.read(22, 4);
    return res;
    // ws.on('open', function open() {
    //   ws.send([res]);
    // });
  } catch (err) {
    console.error('Failed to read sensor data:', err);
  }
};

getTemp().then((res) => console.log('res', res));

ws.on('message', function incoming(data) {
  console.log(data);
});
