import type { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { AppStatus } from './types';
import type { IHealthcheckController, IHealthcheckService } from './types';

export class HealthcheckController implements IHealthcheckController {
	constructor(private readonly healthcheckService: IHealthcheckService) {}

	async getHealth(_req: Request, res: Response): Promise<void> {
		const result = await this.healthcheckService.checkHealth();
		const statusCode = result.status === AppStatus.HEALTHY ? httpStatus.OK : httpStatus.INTERNAL_SERVER_ERROR;
		res.status(statusCode).json(result);
	}
}
