import io from 'socket.io-client';
import sensor from 'node-dht-sensor';
import cron from 'cron';

const asyncSensor = sensor.promises;
const CronJob = cron.CronJob;

/**
 * GET this form envFile
 */

const SENSOR_ID: string = 'INSIDE';

const socket = io('http://10.0.0.126:8080/', {
  reconnection: true,
  forceNew: true,
});

const liveUpdateNameSpace = io('http://10.0.0.126:8080/liveUpdates', {
  reconnection: true,
  forceNew: true,
});

let liveFeedInterval;
const getTemp = async () => {
  try {
    sensor.initialize({
      test: {
        fake: {
          temperature: 21,
          humidity: 60,
        },
      },
    });
    const x = await asyncSensor.read(22, 4);
    const res = JSON.stringify(x);
    return res;
  } catch (err) {
    const x = JSON.stringify(err);
    console.error('Failed to read sensor data:', err);
  }
};

// setInterval(() => {
//   sentTempToSocket();
// }, 500);

const sentTempToSocket = async () => {
  const res = await getTemp();
  await socket.emit('oneMinuteData', { sensor: SENSOR_ID, data: res });
};

liveUpdateNameSpace.on('TURNON', () => {
  liveFeedInterval = setInterval((data) => {
    sentLiveToSocket();
  }, 50);
});

liveUpdateNameSpace.on('TURNOFF', () => {
  clearInterval(liveFeedInterval);
});

liveUpdateNameSpace.on('disconnect', () => {
  console.log('disconnect');
  clearInterval(liveFeedInterval);
});

const sentLiveToSocket = async () => {
  const res = await getTemp();
  await liveUpdateNameSpace.emit('liveUpdateNameSpace', {
    sensor: SENSOR_ID,
    data: res,
  });
};

/**
 * CRON JOB TO SEND DATA EVERY MIN
 */
const saveEveryMin = new CronJob('*/1 * * * *', () => {
  sentTempToSocket();
});

saveEveryMin.start();
