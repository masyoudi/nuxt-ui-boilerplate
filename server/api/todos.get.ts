import { faker } from '@faker-js/faker';

export default defineEventHandler((event) => {
  const q = getQuery(event);
  const page = Number.parseInt(String(q.page)) || 1;
  const perPage = Number.parseInt(String(q.perpage)) || 10;
  const data = [...Array(!Number.isNaN(perPage) ? perPage : 10)].map((_, i) => ({
    id: page <= 1 ? (i + 1) : ((page - 1) * perPage) + (i + 1),
    task: faker.word.words(),
    description: faker.lorem.paragraph(),
    created_at: faker.date.recent()
  }));

  return data;
});
