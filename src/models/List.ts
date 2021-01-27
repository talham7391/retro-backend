import Database from "../Database";
import Utils from './Utils';

const LIST_COLLECTION = 'lists';

async function getCollection() {
  const client = await Database.getClient();
  return client.collection(LIST_COLLECTION);
}

async function create() {
  const collection = await getCollection();
  const listId = await Utils.generateId(async (id) => {
    return await collection.find({ _id: id }).count();
  });
  const emptyList = {
    _id: listId,
    items: [],
  };
  await collection.insertOne(emptyList);
  return listId;
}

async function get(listId: string) {
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: listId });
  doc.id = doc._id;
  delete doc._id;
  return doc;
}

async function addItem(listId: string, content: string) {
  const collection = await getCollection();
  const itemId = await Utils.generateId(async (id) => {
    return await collection.find({ _id: listId, 'items.id': id }).count();
  });
  const item = {
    id: itemId,
    content,
    resolution: 'open',
    votes: [],
  };
  await collection.updateOne(
    { _id: listId },
    { $push: { items: item } },
  );
  return itemId;
}

async function deleteItem(listId: string, itemId: string) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: listId },
    { $pull: { items: { id: itemId } } },
  );
}

type Properties = {
  content?: string,
  resolution?: string,
};
async function modifyItem(listId: string, itemId: string, properties: Properties) {
  const collection = await getCollection();

  const setValue: { [key: string]: string } = {};
  if (properties.content != null) {
    setValue['items.$.content'] = properties.content;
  }
  if (properties.resolution != null) {
    setValue['items.$.resolution'] = properties.resolution;
  }

  await collection.updateOne(
    { _id: listId, 'items.id': itemId },
    { $set: setValue },
  );
}

async function reorderItem(listId: string, itemId: string, index: number) {
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: listId });
  for (const item of doc.items) {
    if (item.id === itemId) {
      await collection.updateOne(
        { _id: listId },
        { $pull: { items: { id: itemId } } },
      );
      await collection.updateOne(
        { _id: listId },
        { $push: { items: { $each: [item], $position: index } } }
      );
      return;
    }
  }
}

async function voteItem(listId: string, itemId: string, user: string, vote: boolean) {
  const collection = await getCollection();
  if (vote) {
    await collection.updateOne(
      { _id: listId, 'items.id': itemId },
      { $push: { 'items.$.votes': user } },
    );
  } else {
    await collection.updateOne(
      { _id: listId, 'items.id': itemId },
      { $pull: { 'items.$.votes': user } },
    );
  }
}

export default {
  create,
  get,
  addItem,
  deleteItem,
  modifyItem,
  reorderItem,
  voteItem,
}
