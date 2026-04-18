import { faker } from '@faker-js/faker';

const modules = {
  airline: faker.airline,
  animal: faker.animal,
  book: faker.book,
  color: faker.color,
  commerce: faker.commerce,
  company: faker.company,
  database: faker.database,
  datatype: faker.datatype,
  date: faker.date,
  finance: faker.finance,
  food: faker.food,
  git: faker.git,
  hacker: faker.hacker,
  image: faker.image,
  internet: faker.internet,
  location: faker.location,
  lorem: faker.lorem,
  music: faker.music,
  number: faker.number,
  person: faker.person,
  phone: faker.phone,
  science: faker.science,
  string: faker.string,
  system: faker.system,
  vehicle: faker.vehicle,
  word: faker.word
};

const deprecateds = [
  'internet.color',
  'internet.userName'
];

const fakerGenerator = (_modules: (keyof typeof modules)[]) => {
  const filteredModules = Object.keys(modules).filter((moduleKey) => _modules.includes(moduleKey as any));
  return filteredModules.reduce((result, moduleKey) => {
    const items = Object.keys((modules as any)[moduleKey]).reduce((prev, funcKey) => {
      const func = (modules as any)[moduleKey]?.[funcKey];

      if (typeof func === 'function' && !deprecateds.includes(`${moduleKey}.${funcKey}`)) {
        prev[funcKey] = func?.() ?? '';
      }

      return prev;
    }, {} as Record<string, any>);

    result[moduleKey] = items;

    return result;
  }, {} as Record<string, any>);
};

export default authSessionHandler((event) => {
  const q = getQuery(event);
  const page = Number(q.page) || 1;
  const perPage = (Number.parseInt(String(q.perpage)));
  const requestedModules = String(q.modules || 'book,lorem').split(',');
  const data: Record<string, any>[] = [...Array(!Number.isNaN(perPage) ? perPage : 10)].map((_, i) => ({
    id: page <= 1 ? (i + 1) : ((page - 1) * perPage) + (i + 1),
    ...fakerGenerator(requestedModules as any)
  }));

  return {
    data,
    total: data.length
  };
});
