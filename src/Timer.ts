import { Namespace, Socket } from "socket.io";

enum TIMER_STATUS {
  CLEAR = 'CLEAR',
  STOPPED = 'STOPPED',
  ACTIVE = 'ACTIVE',
}

let time: number = 0;
let status: TIMER_STATUS = TIMER_STATUS.CLEAR;

const tick = () => {
  if (status === TIMER_STATUS.ACTIVE) {
    time -= 1;
    if (time <= 0) {
      time = 0;
      status = TIMER_STATUS.STOPPED;
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
      status = TIMER_STATUS.ACTIVE;
      sendData();
    });

    socket.on('START_TIMER', () => {
      status = TIMER_STATUS.ACTIVE;
      sendData();
    });

    socket.on('STOP_TIMER', () => {
      status = TIMER_STATUS.STOPPED;
      sendData();
    });

    socket.on('CLEAR_TIMER', () => {
      time = 0;
      status = TIMER_STATUS.CLEAR;
      sendData();
    });
  };
};

export default {
  timerConnectionHandler,
};
