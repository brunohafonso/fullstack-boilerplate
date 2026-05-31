import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { User } from '../../../generated/prisma';
import { NotFoundError } from '../../../shared/errors/index.js';
import { makeUser } from './fixtures.js';

const mockPrismaUser = {
	findMany: jest.fn<() => Promise<User[]>>(),
	findUnique: jest.fn<(args: unknown) => Promise<User | null>>(),
	create: jest.fn<(args: unknown) => Promise<User>>(),
	update: jest.fn<(args: unknown) => Promise<User>>(),
	delete: jest.fn<(args: unknown) => Promise<User>>(),
};

jest.unstable_mockModule('../../../lib/prisma', () => ({
	prisma: { user: mockPrismaUser },
}));

const { UsersService } = await import('../service.js');

describe('UsersService', () => {
	let service: InstanceType<typeof UsersService>;

	beforeEach(() => {
		service = new UsersService();
		jest.clearAllMocks();
	});

	describe('findAll', () => {
		it('returns all users', async () => {
			const users = [makeUser(), makeUser()];
			mockPrismaUser.findMany.mockResolvedValue(users);

			const result = await service.findAll();

			expect(result).toEqual(users);
			expect(mockPrismaUser.findMany).toHaveBeenCalledTimes(1);
		});

		it('returns empty array when no users exist', async () => {
			mockPrismaUser.findMany.mockResolvedValue([]);

			const result = await service.findAll();

			expect(result).toEqual([]);
		});
	});

	describe('findById', () => {
		it('returns the user when found', async () => {
			const user = makeUser({ id: 1 });
			mockPrismaUser.findUnique.mockResolvedValue(user);

			const result = await service.findById(1);

			expect(result).toEqual(user);
			expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
		});

		it('throws NotFoundError when user does not exist', async () => {
			mockPrismaUser.findUnique.mockResolvedValue(null);

			await expect(service.findById(999)).rejects.toThrow(NotFoundError);
			expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
		});
	});

	describe('create', () => {
		it('creates and returns the new user', async () => {
			const input = { email: 'bob@example.com', name: 'Bob' };
			const created = makeUser(input);
			mockPrismaUser.create.mockResolvedValue(created);

			const result = await service.create(input);

			expect(result).toEqual(created);
			expect(mockPrismaUser.create).toHaveBeenCalledWith({ data: input });
		});
	});

	describe('update', () => {
		it('returns the updated user on success', async () => {
			const updated = makeUser({ id: 1, name: 'Alice Updated' });
			mockPrismaUser.update.mockResolvedValue(updated);

			const result = await service.update(1, { name: 'Alice Updated' });

			expect(result).toEqual(updated);
			expect(mockPrismaUser.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { name: 'Alice Updated' },
			});
		});

		it('throws NotFoundError when the user does not exist', async () => {
			mockPrismaUser.update.mockRejectedValue(new Error('Record not found'));

			await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundError);
		});
	});

	describe('delete', () => {
		it('returns the deleted user on success', async () => {
			const user = makeUser({ id: 1 });
			mockPrismaUser.delete.mockResolvedValue(user);

			const result = await service.delete(1);

			expect(result).toEqual(user);
			expect(mockPrismaUser.delete).toHaveBeenCalledWith({ where: { id: 1 } });
		});

		it('throws NotFoundError when the user does not exist', async () => {
			mockPrismaUser.delete.mockRejectedValue(new Error('Record not found'));

			await expect(service.delete(999)).rejects.toThrow(NotFoundError);
		});
	});
});
