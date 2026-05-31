import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AppStatus, DatabaseStatus } from '../types.js';

const mockQueryRaw = jest.fn<() => Promise<unknown>>();

jest.unstable_mockModule('../../../lib/prisma', () => ({
	prisma: { $queryRaw: mockQueryRaw },
}));

const { HealthcheckService } = await import('../service.js');

describe('HealthcheckService', () => {
	let service: InstanceType<typeof HealthcheckService>;

	beforeEach(() => {
		service = new HealthcheckService('api', '1.0.0');
		jest.clearAllMocks();
	});

	describe('checkHealth', () => {
		it('returns HEALTHY with connected database status when DB is reachable', async () => {
			mockQueryRaw.mockResolvedValue([{ 1: 1 }]);

			const result = await service.checkHealth();

			expect(result.status).toBe(AppStatus.HEALTHY);
			expect(result.database).toEqual({ status: DatabaseStatus.CONNECTED });
			expect(result.name).toBe('api');
			expect(result.version).toBe('1.0.0');
			expect(result.uptime).toMatch(/^\d+ secs$/);
		});

		it('returns UNHEALTHY with disconnected status and error when DB throws', async () => {
			mockQueryRaw.mockRejectedValue(new Error('connection refused'));

			const result = await service.checkHealth();

			expect(result.status).toBe(AppStatus.UNHEALTHY);
			expect(result.database).toEqual({ status: DatabaseStatus.DISCONNECTED, error: 'connection refused' });
			expect(result.name).toBe('api');
			expect(result.version).toBe('1.0.0');
			expect(result.uptime).toMatch(/^\d+ secs$/);
		});

		it('handles non-Error thrown values gracefully', async () => {
			mockQueryRaw.mockRejectedValue('string error');

			const result = await service.checkHealth();

			expect(result.status).toBe(AppStatus.UNHEALTHY);
			expect(result.database).toEqual({ status: DatabaseStatus.DISCONNECTED, error: 'unknown error' });
		});
	});
});
