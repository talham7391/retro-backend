import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import List from '../../../db/models/List';

const create = async (req: Request, res: Response, next: NextFunction) => {
  const itemId = await List.addItem(req.params.listId, req.body.content);
  res.json({ id: itemId });
  res.locals.realtimeListUpdates.push({
    type: 'ITEM_CREATED',
    payload: { listId: req.params.listId, itemId, content: req.body.content },
  });
  next();
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  await List.modifyItem(req.params.listId, req.params.itemId, { ...req.body });
  res.sendStatus(200);
  res.locals.realtimeListUpdates.push({
    type: 'ITEM_CHANGED',
    payload: { listId: req.params.listId, itemId: req.params.itemId, content: req.body.content },
  });
  next();
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  await List.deleteItem(req.params.listId, req.params.itemId);
  res.sendStatus(200);
  res.locals.realtimeListUpdates.push({
    type: 'ITEM_DELETED',
    payload: { listId: req.params.listId, itemId: req.params.itemId },
  });
  next();
};

const reorderAction = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.query.index === 'string') {
    await List.reorderItem(req.params.listId, req.params.itemId, parseInt(req.query.index, 10));
    res.sendStatus(200);
    res.locals.realtimeListUpdates.push({
      type: 'LIST_REORDERED',
      payload: { listId: req.params.listId },
    });
  } else {
    res.sendStatus(500);
  }
  next();
};

const voteAction = async (req: Request, res: Response, next: NextFunction) => {
  let { user } = req.body;
  if (user == null) {
    user = uuidv4();
  }
  const vote = req.query.vote === 'true';
  await List.voteItem(req.params.listId, req.params.itemId, user, vote);
  res.json({ user });

  res.locals.realtimeListUpdates.push({
    type: 'ITEM_VOTES_CHANGED',
    payload: { listId: req.params.listId, itemId: req.params.itemId, vote },
  });

  next();
};

export default {
  create,
  update,
  remove,
  reorderAction,
  voteAction,
};
