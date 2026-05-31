import { Router } from 'express';

import type { IHealthcheckController } from './types';

export class HealthcheckRouter {
	readonly router = Router();

	constructor(private readonly healthcheckController: IHealthcheckController) {
		this.router.get('/', (req, res) => this.healthcheckController.getHealth(req, res));
	}

	public getRouter(): Router {
		return this.router;
	}
}
