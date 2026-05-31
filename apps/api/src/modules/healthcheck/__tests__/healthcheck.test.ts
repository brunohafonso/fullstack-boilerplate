import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';

import { App } from '../../../App';
import type { ILogger } from '../../../shared/types';
import { AppStatus, DatabaseStatus } from '../types.js';

const noopLogger: ILogger = {
	info: () => undefined,
	warn: () => undefined,
	error: () => undefined,
};

let app: App;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
	app = new App(noopLogger);
	await app.initApplication();
	request = supertest(app.getInstance());
});

afterAll(async () => {
	await app.stopApplication();
});

describe('GET /healthcheck', () => {
	it('returns 200 with HEALTHY status when database is connected', async () => {
		const res = await request.get('/healthcheck');

		expect(res.status).toBe(StatusCodes.OK);
		expect(res.body).toMatchObject({
			name: expect.any(String),
			version: expect.any(String),
			uptime: expect.stringMatching(/^\d+ secs$/),
			status: AppStatus.HEALTHY,
			database: { status: DatabaseStatus.CONNECTED },
		});
	});

	it('returns name and version from package.json', async () => {
		const res = await request.get('/healthcheck');

		expect(res.status).toBe(StatusCodes.OK);
		expect(res.body.name).toBe('api');
		expect(res.body.version).toBe('1.0.0');
	});
});
