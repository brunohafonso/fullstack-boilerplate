import type { Request, Response } from 'express';

export enum AppStatus {
	HEALTHY = 'HEALTHY',
	UNHEALTHY = 'UNHEALTHY',
}

export enum DatabaseStatus {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected',
}

export interface IDatabaseStatus {
	status: DatabaseStatus;
	error?: string;
}

export interface HealthcheckResult {
	name: string;
	version: string;
	uptime: string;
	status: AppStatus;
	database: IDatabaseStatus;
}

export interface IHealthcheckService {
	checkHealth(): Promise<HealthcheckResult>;
}

export interface IHealthcheckController {
	getHealth(req: Request, res: Response): Promise<void>;
}
