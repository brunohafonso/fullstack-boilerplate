import { faker } from '@faker-js/faker';

import type { Prisma, User } from '../../../generated/prisma';

export function makeUser(overrides?: Partial<User>): User {
	return {
		id: faker.number.int({ min: 1, max: 10_000 }),
		email: faker.internet.email(),
		name: faker.person.fullName(),
		createdAt: faker.date.past(),
		updatedAt: faker.date.recent(),
		...overrides,
	};
}

export function makeUserInput(overrides?: Partial<Prisma.UserCreateInput>): Prisma.UserCreateInput {
	return {
		email: faker.internet.email(),
		name: faker.person.fullName(),
		...overrides,
	};
}
