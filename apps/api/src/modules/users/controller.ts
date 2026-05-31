import type { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { SchemaValidator } from '../../shared/validators';
import { createUserSchema, deleteUserSchema, getUserByIdSchema, updateUserSchema } from './schemas';
import type { IUsersController, IUsersService } from './types';

export class UsersController implements IUsersController {
	constructor(private readonly usersService: IUsersService) {}

	async getUsers(_req: Request, res: Response): Promise<void> {
		const users = await this.usersService.findAll();
		res.json(users);
	}

	async getUserById(req: Request, res: Response): Promise<void> {
		const { params } = new SchemaValidator(getUserByIdSchema).validate(req);
		const user = await this.usersService.findById(params.id);
		res.json(user);
	}

	async createUser(req: Request, res: Response): Promise<void> {
		const { body } = new SchemaValidator(createUserSchema).validate(req);
		const user = await this.usersService.create(body);
		res.status(httpStatus.CREATED).json(user);
	}

	async updateUser(req: Request, res: Response): Promise<void> {
		const { params, body } = new SchemaValidator(updateUserSchema).validate(req);
		const user = await this.usersService.update(params.id, body);
		res.json(user);
	}

	async deleteUser(req: Request, res: Response): Promise<void> {
		const { params } = new SchemaValidator(deleteUserSchema).validate(req);
		await this.usersService.delete(params.id);
		res.sendStatus(httpStatus.NO_CONTENT);
	}
}
