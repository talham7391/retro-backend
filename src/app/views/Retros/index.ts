import { NextFunction, Request, Response } from 'express';
import Retro from '../../db/models/Retro';

const list = async (req: Request, res: Response, next: NextFunction) => {
  res.json(await Retro.all());
  next();
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const retroId = await Retro.create();
  res.json({ id: retroId });
  next();
};

const finishAction = async (req: Request, res: Response, next: NextFunction) => {
  await Retro.finish(req.params.retroId);
  res.sendStatus(200);
  next();
};

export default {
  list,
  create,
  finishAction,
};
