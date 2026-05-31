import { Router } from 'express';

import type { IUsersController } from './types';

export class UsersRouter {
	readonly router = Router();

	constructor(private readonly usersController: IUsersController) {
		this.router.get('/', (req, res) => this.usersController.getUsers(req, res));
		this.router.get('/:id', (req, res) => this.usersController.getUserById(req, res));
		this.router.post('/', (req, res) => this.usersController.createUser(req, res));
		this.router.patch('/:id', (req, res) => this.usersController.updateUser(req, res));
		this.router.delete('/:id', (req, res) => this.usersController.deleteUser(req, res));
	}

	public getRouter(): Router {
		return this.router;
	}
}
