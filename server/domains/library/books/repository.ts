import { Faker, base, en } from '@faker-js/faker';
import type { BookDto, BookListDto, ListBooksDto } from './dto';

const faker = new Faker({ locale: [en, base] });
faker.seed(20260924);

const books: BookDto[] = Array.from({ length: 100 }, () => ({
  id: faker.string.uuid(),
  title: faker.book.title(),
  author: faker.book.author(),
  series: faker.book.series(),
  genre: faker.book.genre(),
  format: faker.book.format(),
  publisher: faker.book.publisher()
}));

async function getAll({ limit, offset }: ListBooksDto): Promise<BookListDto> {
  return {
    data: books.slice(offset, offset + limit),
    total: books.length
  };
}

export default {
  getAll
};
