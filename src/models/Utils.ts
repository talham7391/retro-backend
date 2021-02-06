import { v4 as uuidv4 } from 'uuid';

async function generateId(check: (id: string) => Promise<number>): Promise<string> {
  const id = uuidv4();
  if (await check(id) === 0) {
    return id;
  }
  return generateId(check);
}

export default {
  generateId,
};
