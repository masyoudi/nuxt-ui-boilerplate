import type { ListTasksDto } from './dto';
import repository from './repository';

async function getAll(query: ListTasksDto) {
  return await repository.getAll(query);
}

export default {
  getAll
};
