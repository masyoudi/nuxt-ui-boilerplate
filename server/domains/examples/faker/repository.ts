import { Faker, base, en } from '@faker-js/faker';
import type { FakerDataDto, FakerDataListDto, ListFakerDataDto } from './dto';

const faker = new Faker({ locale: [en, base] });
faker.seed(20260924);

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

const deprecatedMethods = [
  'internet.color',
  'internet.userName'
];

function generateData(requestedModules: string[]) {
  const selectedModules = Object.keys(modules).filter((module) => requestedModules.includes(module));

  return selectedModules.reduce((result, moduleKey) => {
    const module = modules[moduleKey as keyof typeof modules];
    const values = Object.keys(module).reduce((items, methodKey) => {
      const method = (module as any)[methodKey];

      if (typeof method === 'function' && !deprecatedMethods.includes(`${moduleKey}.${methodKey}`)) {
        items[methodKey] = method() ?? '';
      }

      return items;
    }, {} as FakerDataDto);

    result[moduleKey] = values;

    return result;
  }, {} as FakerDataDto);
}

async function getAll({ limit, offset, modules: requestedModules }: ListFakerDataDto): Promise<FakerDataListDto> {
  const data = Array.from({ length: limit }, (_, index) => ({
    id: offset + index + 1,
    ...generateData(requestedModules)
  }));

  return {
    data,
    total: data.length
  };
}

export default {
  getAll
};
