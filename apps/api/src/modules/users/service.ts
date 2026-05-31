import type { Prisma, User } from '../../generated/prisma/index';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../shared/errors';
import type { IUsersService } from './types';

export class UsersService implements IUsersService {
	findAll(): Promise<User[]> {
		return prisma.user.findMany();
	}

	async findById(id: number): Promise<User> {
		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) throw new NotFoundError('User not found', 'USER_NOT_FOUND');
		return user;
	}

	create(data: Prisma.UserCreateInput): Promise<User> {
		return prisma.user.create({ data });
	}

	async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
		const user = await prisma.user.update({ where: { id }, data }).catch(() => null);
		if (!user) throw new NotFoundError('User not found', 'USER_NOT_FOUND');
		return user;
	}

	async delete(id: number): Promise<User> {
		const user = await prisma.user.delete({ where: { id } }).catch(() => null);
		if (!user) throw new NotFoundError('User not found', 'USER_NOT_FOUND');
		return user;
	}
}
