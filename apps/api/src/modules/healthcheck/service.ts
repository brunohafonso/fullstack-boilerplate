import { prisma } from '../../lib/prisma';
import { AppStatus, DatabaseStatus } from './types';
import type { HealthcheckResult, IDatabaseStatus, IHealthcheckService } from './types';

export class HealthcheckService implements IHealthcheckService {
	constructor(
		private readonly name: string,
		private readonly version: string,
	) {}

	private async checkDatabase(): Promise<IDatabaseStatus> {
		try {
			await prisma.$queryRaw`SELECT 1`;
			return { status: DatabaseStatus.CONNECTED };
		} catch (error) {
			return {
				status: DatabaseStatus.DISCONNECTED,
				error: error instanceof Error ? error.message : 'unknown error',
			};
		}
	}

	async checkHealth(): Promise<HealthcheckResult> {
		const database = await this.checkDatabase();
		return {
			name: this.name,
			version: this.version,
			uptime: `${Math.floor(process.uptime())} secs`,
			status: database.status === DatabaseStatus.CONNECTED ? AppStatus.HEALTHY : AppStatus.UNHEALTHY,
			database,
		};
	}
}
