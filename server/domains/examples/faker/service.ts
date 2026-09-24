import type { ListFakerDataDto } from './dto';
import repository from './repository';

async function getAll(query: ListFakerDataDto) {
  return await repository.getAll(query);
}

export default {
  getAll
};
