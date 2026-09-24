import type { UpdateProfileDto } from './dto';
import repository from './repository';

async function update(input: UpdateProfileDto) {
  await repository.update(input);

  return { success: true };
}

export default {
  update
};
