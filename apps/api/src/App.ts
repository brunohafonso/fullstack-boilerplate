import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { createServer, type Server } from 'http';

import { type AppConfig, validateEnvironmentVariables } from './config';
import { prisma } from './lib/prisma';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { createHealthcheckRouter } from './modules/healthcheck/factory';
import { createUsersRouter } from './modules/users/factory';
import { Logger } from './shared/logger';
import type { ILogger } from './shared/types';

export class App {
	private readonly application: Express;
	private readonly server: Server;
	private config!: AppConfig;

	constructor(private readonly logger: ILogger = Logger.getInstance()) {
		this.application = express();
		this.server = createServer(this.application);
	}

	private validateEnvironmentVariables(): void {
		this.logger.info('validating environment variables');
		this.config = validateEnvironmentVariables();
	}

	private setupGlobalMiddlewares(): void {
		this.logger.info('setting up global middlewares');
		this.application.use(requestLogger(this.logger));
		this.application.use(cors({ origin: '*' }));
		this.application.use(express.json());
		this.application.use(express.urlencoded({ extended: false }));
	}

	private setupSecurityMiddlewares(): void {
		this.logger.info('setting up security middlewares');
		this.application.use(helmet());
	}

	private async setupDatabase(): Promise<void> {
		this.logger.info('connecting to database');
		await prisma.$connect();
		this.logger.info('database connected');
	}

	private setupRoutes(): void {
		this.logger.info('setting up application routes');
		this.application.use('/healthcheck', createHealthcheckRouter().getRouter());
		this.application.use('/users', createUsersRouter().getRouter());
		this.application.use(errorHandler(this.logger));
	}

	public getInstance(): Express {
		return this.application;
	}

	public getServerInstance(): Server {
		return this.server;
	}

	public async initApplication(): Promise<void> {
		this.logger.info('initializing application');
		this.validateEnvironmentVariables();
		await this.setupDatabase();
		this.setupSecurityMiddlewares();
		this.setupGlobalMiddlewares();
		this.setupRoutes();
	}

	public initServer(): void {
		this.server.listen(this.config.port, () => {
			this.logger.info(`server listening on port ${this.config.port} in ${this.config.nodeEnv} environment`);
		});
	}

	private async closeDatabaseConnection(): Promise<void> {
		this.logger.info('closing database connection');
		await prisma.$disconnect();
		this.logger.info('database connection closed');
	}

	public stopServer(): Promise<void> {
		this.logger.info('closing server');
		return new Promise(resolve => {
			if (!this.server.listening) {
				return resolve();
			}
			this.server.close(error => {
				if (error) {
					this.logger.error('error closing server', error);
				}
				resolve();
			});
		});
	}

	public async stopApplication(): Promise<void> {
		this.logger.info('stopping application');
		await this.stopServer();
		await this.closeDatabaseConnection();
	}
}
