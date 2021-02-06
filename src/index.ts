import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';

import Timer from './Timer';
import Retros from './views/Retros';
import Lists from './views/Lists';
import Items from './views/Lists/Items';

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

const timerIO = io.of('timer');
timerIO.on('connection', Timer.timerConnectionHandler(timerIO));

const realtimeUpdatesIO = io.of('realtimeListUpdates');

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.locals.realtimeListUpdates = [];
  next();
});

app.get('/', (req, res, next) => {
  res.sendStatus(200);
  next();
});

app.get('/retros', Retros.list);
app.post('/retros', Retros.create);
app.post('/retros/:retroId/finish', Retros.finishAction);
app.post('/lists', Lists.create);
app.get('/lists/:listId', Lists.get);
app.post('/lists/:listId/items', Items.create);
app.put('/lists/:listId/items/:itemId', Items.update);
app.delete('/lists/:listId/items/:itemId', Items.remove);
app.post('/lists/:listId/items/:itemId/reorder', Items.reorderAction);
app.put('/lists/:listId/items/:itemId/vote', Items.voteAction);

app.use(async (req, res, next) => {
  if (res.locals.realtimeListUpdates.length > 0) {
    realtimeUpdatesIO.emit('UPDATES', res.locals.realtimeListUpdates);
  }
  next();
});

server.listen(3000, () => {
  console.log('Listening on *:3000');
});
