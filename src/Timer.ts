import { Namespace, Socket } from 'socket.io';

enum TimerStatus {
  CLEAR = 'CLEAR',
  STOPPED = 'STOPPED',
  ACTIVE = 'ACTIVE',
}

let time: number = 0;
let status: TimerStatus = TimerStatus.CLEAR;

const tick = () => {
  if (status === TimerStatus.ACTIVE) {
    time -= 1;
    if (time <= 0) {
      time = 0;
      status = TimerStatus.STOPPED;
    }
  }
};

const timerConnectionHandler = (namespace: Namespace) => {
  const sendData = () => namespace.emit('data', { time, status });

  setInterval(() => {
    tick();
    sendData();
  }, 1000);

  return (socket: Socket) => {
    socket.on('INIT_TIMER', (t) => {
      time = t;
      status = TimerStatus.ACTIVE;
      sendData();
    });

    socket.on('START_TIMER', () => {
      status = TimerStatus.ACTIVE;
      sendData();
    });

    socket.on('STOP_TIMER', () => {
      status = TimerStatus.STOPPED;
      sendData();
    });

    socket.on('CLEAR_TIMER', () => {
      time = 0;
      status = TimerStatus.CLEAR;
      sendData();
    });
  };
};

export default {
  timerConnectionHandler,
};
