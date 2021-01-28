import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
const cors = require('cors');
import http from 'http';
import Timer from './Timer';
import Retro from './models/Retro';
import List from './models/List';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
  },
});

const timerIO = io.of('timer');
timerIO.on('connection', Timer.timerConnectionHandler(timerIO));

const realtimeUpdatesIO = io.of('realtimeListUpdates');

const corsOptions = {
  origin: 'http://platform-retro.surge.sh',
  optionsSuccessStatus: 200,
  credentials: true,
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.realtimeListUpdates = [];
  next();
});

app.get('/', (req, res, next) => {
  res.send('Hello, World!');
  next();
});

app.get('/retros', async (req, res, next) => {
  res.json(await Retro.all());
  next();
});

app.post('/retros', async (req, res, next) => {
  const retroId = await Retro.create();
  res.json({ id: retroId });
  next();
});

app.post('/retros/:retroId/finish', async (req, res, next) => {
  await Retro.finish(req.params.retroId);
  res.sendStatus(200);
  next();
});

app.post('/lists', async (req, res, next) => {
  res.json({ id: await List.create() });
  next();
});

app.get('/lists/:listId', async (req, res, next) => {
  res.json(await List.get(req.params.listId));
  next();
});

app.post('/lists/:listId/items', async (req, res, next) => {
  const itemId = await List.addItem(req.params.listId, req.body.content);
  res.json({ id: itemId });
  res.locals.realtimeListUpdates.push({
    type: 'ITEM_CREATED',
    payload: { listId: req.params.listId, itemId, content: req.body.content },
  });
  next();
});

app.put('/lists/:listId/items/:itemId', async (req, res, next) => {
  await List.modifyItem(req.params.listId, req.params.itemId, { ...req.body });
  res.sendStatus(200);
  res.locals.realtimeListUpdates.push({
    type: 'ITEM_CHANGED',
    payload: { listId: req.params.listId, itemId: req.params.itemId, content: req.body.content },
  });
  next();
});

app.delete('/lists/:listId/items/:itemId', async (req, res, next) => {
  await List.deleteItem(req.params.listId, req.params.itemId);
  res.sendStatus(200);
  res.locals.realtimeListUpdates.push({
    type: 'ITEM_DELETED',
    payload: { listId: req.params.listId, itemId: req.params.itemId },
  });
  next();
});

app.post('/lists/:listId/items/:itemId/reorder', async (req, res, next) => {
  if (typeof req.query.index === 'string') {
    await List.reorderItem(req.params.listId, req.params.itemId, parseInt(req.query.index));
    res.sendStatus(200);
    res.locals.realtimeListUpdates.push({
      type: 'LIST_REORDERED',
      payload: { listId: req.params.listId },
    });
  } else {
    res.sendStatus(500);
  }
  next();
});

app.put('/lists/:listId/items/:itemId/vote', async (req, res, next) => {
  let user = req.cookies.user;
  if (user == null) {
    user = uuidv4();
    res.cookie('user', user);
  }
  const vote = req.query.vote === 'true';
  await List.voteItem(req.params.listId, req.params.itemId, user, vote)
  res.sendStatus(200);

  res.locals.realtimeListUpdates.push({
    type: 'ITEM_VOTES_CHANGED',
    payload: { listId: req.params.listId, itemId: req.params.itemId, vote },
  });

  next();
});

app.use(async (req, res, next) => {
  if (res.locals.realtimeListUpdates.length > 0) {
    realtimeUpdatesIO.emit('UPDATES', res.locals.realtimeListUpdates);
  }
  next();
});

server.listen(3000, () => {
  console.log('Listening on *:3000');
});
