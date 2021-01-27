import { MongoClient } from 'mongodb';

const uri = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`;
const client = new MongoClient(uri);

async function getClient() {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db('retro');
}

async function close() {
  await client.close();
}

export default { getClient, close };
