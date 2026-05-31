import type { Request, Response } from 'express';

import type { Prisma, User } from '../../generated/prisma';

export interface IUsersService {
	findAll(): Promise<User[]>;
	findById(id: number): Promise<User>;
	create(data: Prisma.UserCreateInput): Promise<User>;
	update(id: number, data: Prisma.UserUpdateInput): Promise<User>;
	delete(id: number): Promise<User>;
}

export interface IUsersController {
	getUsers(req: Request, res: Response): Promise<void>;
	getUserById(req: Request, res: Response): Promise<void>;
	createUser(req: Request, res: Response): Promise<void>;
	updateUser(req: Request, res: Response): Promise<void>;
	deleteUser(req: Request, res: Response): Promise<void>;
}
