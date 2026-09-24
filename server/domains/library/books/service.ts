import type { ListBooksDto } from './dto';
import repository from './repository';

async function getAll(query: ListBooksDto) {
  return await repository.getAll(query);
}

export default {
  getAll
};
