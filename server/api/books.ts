import type { H3Event } from 'h3';
import { faker } from '@faker-js/faker';

async function handler(event: H3Event) {
  const q = getQuery(event);
  const perPage = (Number.parseInt(String(q.perpage)));
  const data = [...Array(!Number.isNaN(perPage) ? perPage : 10)].map(() => ({
    id: faker.string.uuid(),
    title: faker.book.title(),
    author: faker.book.author(),
    series: faker.book.series(),
    genre: faker.book.genre(),
    format: faker.book.format(),
    publisher: faker.book.publisher()
  }));

  return {
    data,
    total: 100
  };
}

export default defineEventHandler({
  onRequest: [authSessionHandler],
  handler
});
