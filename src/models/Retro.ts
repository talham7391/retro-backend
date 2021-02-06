import Database from '../Database';
import Utils from './Utils';
import List from './List';

const RETRO_COLLECTION = 'retros';

async function getCollection() {
  const client = await Database.getClient();
  return client.collection(RETRO_COLLECTION);
}

async function create() {
  const collection = await getCollection();
  const retroId = await Utils.generateId(async (id) => collection.find({ _id: id }).count());

  const wentWellListId = await List.create();
  const needsImprovementListId = await List.create();

  const newRetro = {
    _id: retroId,
    lists: {
      wentWell: wentWellListId,
      needsImprovement: needsImprovementListId,
    },
    finishedOn: null,
  };

  await collection.insertOne(newRetro);
  return retroId;
}

async function all() {
  const collection = await getCollection();
  const result = await collection.find({});
  return (await result.toArray()).map((r) => {
    const v = { ...r, id: r._id };
    delete v._id;
    return v;
  });
}

async function finish(retroId: string) {
  const collection = await getCollection();
  const secondsSinceEpoch = Math.trunc(Date.now() / 1000);
  await collection.updateOne(
    { _id: retroId },
    { $set: { finishedOn: secondsSinceEpoch } },
  );
}

export default {
  create,
  all,
  finish,
};
