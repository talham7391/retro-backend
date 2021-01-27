import { v4 as uuidv4 } from 'uuid';

async function generateId(check: (id: string) => Promise<number> ): Promise<string> {
  while (true) {
    const id = uuidv4();
    if (await check(id) === 0) {
      return id;
    }
  }
}

export default {
  generateId,
}
