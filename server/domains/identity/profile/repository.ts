import type { UpdateProfileDto } from './dto';

const profiles = new Map<string, UpdateProfileDto>();

async function update(data: UpdateProfileDto) {
  profiles.set(data.email, data);
}

export default {
  update
};
