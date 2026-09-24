import { Faker, base, en } from '@faker-js/faker';
import type { ListTasksDto, TaskDto, TaskListDto } from './dto';

const faker = new Faker({ locale: [en, base] });
faker.seed(20260924);

const tasks: TaskDto[] = Array.from({ length: 500 }, (_, index) => ({
  id: index + 1,
  task: faker.word.words({ count: { min: 2, max: 5 } }),
  description: faker.lorem.paragraph(),
  created_at: faker.date.recent()
}));

async function getAll({ limit, offset, q }: ListTasksDto): Promise<TaskListDto> {
  const search = q?.toLowerCase();
  const filteredTasks = search
    ? tasks.filter((task) => [task.task, task.description].some((value) => value.toLowerCase().includes(search)))
    : tasks;

  return {
    data: filteredTasks.slice(offset, offset + limit),
    total: filteredTasks.length
  };
}

export default {
  getAll
};
