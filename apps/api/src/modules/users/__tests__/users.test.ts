import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';

import { App } from '../../../App';
import { prisma } from '../../../lib/prisma';
import type { ILogger } from '../../../shared/types';
import { makeUserInput } from './fixtures.js';

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

beforeEach(async () => {
	await prisma.user.deleteMany();
});

describe('GET /users', () => {
	it('returns 200 with an empty array when no users exist', async () => {
		const res = await request.get('/users');

		expect(res.status).toBe(StatusCodes.OK);
		expect(res.body).toEqual([]);
	});

	it('returns 200 with all users', async () => {
		await prisma.user.createMany({ data: [makeUserInput(), makeUserInput()] });

		const res = await request.get('/users');

		expect(res.status).toBe(StatusCodes.OK);
		expect(res.body).toHaveLength(2);
		expect(res.body[0]).toMatchObject({ id: expect.any(Number), email: expect.any(String) });
	});
});

describe('GET /users/:id', () => {
	it('returns 200 with the user when found', async () => {
		const input = makeUserInput();
		const created = await prisma.user.create({ data: input });

		const res = await request.get(`/users/${created.id}`);

		expect(res.status).toBe(StatusCodes.OK);
		expect(res.body).toMatchObject({ id: created.id, email: input.email, name: input.name });
	});

	it('returns 404 when user does not exist', async () => {
		const res = await request.get('/users/99999');

		expect(res.status).toBe(StatusCodes.NOT_FOUND);
		expect(res.body).toMatchObject({ message: 'User not found' });
	});

	it('returns 400 with validationErrors when id is not a number', async () => {
		const res = await request.get('/users/abc');

		expect(res.status).toBe(StatusCodes.BAD_REQUEST);
		expect(res.body).toMatchObject({
			error: 'Validation failed',
			code: 'MISSING_OR_INVALID_PARAMETERS',
			validationErrors: expect.arrayContaining([expect.objectContaining({ fieldName: 'id' })]),
		});
	});
});

describe('POST /users', () => {
	it('returns 201 with the created user', async () => {
		const input = makeUserInput();

		const res = await request.post('/users').send(input);

		expect(res.status).toBe(StatusCodes.CREATED);
		expect(res.body).toMatchObject({ id: expect.any(Number), email: input.email, name: input.name });
	});

	it('returns 201 with name defaulting to null when omitted', async () => {
		const input = { email: makeUserInput().email };

		const res = await request.post('/users').send(input);

		expect(res.status).toBe(StatusCodes.CREATED);
		expect(res.body).toMatchObject({ email: input.email, name: null });
	});

	it('returns 400 with validationErrors when email is missing', async () => {
		const res = await request.post('/users').send({ name: 'Alice' });

		expect(res.status).toBe(StatusCodes.BAD_REQUEST);
		expect(res.body).toMatchObject({
			error: 'Validation failed',
			code: 'MISSING_OR_INVALID_PARAMETERS',
			validationErrors: expect.arrayContaining([expect.objectContaining({ fieldName: 'email' })]),
		});
	});

	it('returns 400 with validationErrors when email format is invalid', async () => {
		const res = await request.post('/users').send({ email: 'not-an-email' });

		expect(res.status).toBe(StatusCodes.BAD_REQUEST);
		expect(res.body).toMatchObject({
			error: 'Validation failed',
			code: 'MISSING_OR_INVALID_PARAMETERS',
			validationErrors: expect.arrayContaining([expect.objectContaining({ fieldName: 'email' })]),
		});
	});
});

describe('PATCH /users/:id', () => {
	it('returns 200 with the updated user', async () => {
		const created = await prisma.user.create({ data: makeUserInput() });

		const res = await request.patch(`/users/${created.id}`).send({ name: 'Updated Name' });

		expect(res.status).toBe(StatusCodes.OK);
		expect(res.body).toMatchObject({ id: created.id, name: 'Updated Name' });
	});

	it('returns 404 when user does not exist', async () => {
		const res = await request.patch('/users/99999').send({ name: 'Ghost' });

		expect(res.status).toBe(StatusCodes.NOT_FOUND);
		expect(res.body).toMatchObject({ message: 'User not found' });
	});

	it('returns 400 with validationErrors when id is not a number', async () => {
		const res = await request.patch('/users/abc').send({ name: 'Alice' });

		expect(res.status).toBe(StatusCodes.BAD_REQUEST);
		expect(res.body).toMatchObject({
			error: 'Validation failed',
			code: 'MISSING_OR_INVALID_PARAMETERS',
			validationErrors: expect.arrayContaining([expect.objectContaining({ fieldName: 'id' })]),
		});
	});

	it('returns 400 with validationErrors when email format is invalid', async () => {
		const created = await prisma.user.create({ data: makeUserInput() });

		const res = await request.patch(`/users/${created.id}`).send({ email: 'bad-email' });

		expect(res.status).toBe(StatusCodes.BAD_REQUEST);
		expect(res.body).toMatchObject({
			error: 'Validation failed',
			code: 'MISSING_OR_INVALID_PARAMETERS',
			validationErrors: expect.arrayContaining([expect.objectContaining({ fieldName: 'email' })]),
		});
	});
});

describe('DELETE /users/:id', () => {
	it('returns 204 when the user is deleted', async () => {
		const created = await prisma.user.create({ data: makeUserInput() });

		const res = await request.delete(`/users/${created.id}`);

		expect(res.status).toBe(StatusCodes.NO_CONTENT);
		expect(await prisma.user.findUnique({ where: { id: created.id } })).toBeNull();
	});

	it('returns 404 when user does not exist', async () => {
		const res = await request.delete('/users/99999');

		expect(res.status).toBe(StatusCodes.NOT_FOUND);
		expect(res.body).toMatchObject({ message: 'User not found' });
	});

	it('returns 400 with validationErrors when id is not a number', async () => {
		const res = await request.delete('/users/abc');

		expect(res.status).toBe(StatusCodes.BAD_REQUEST);
		expect(res.body).toMatchObject({
			error: 'Validation failed',
			code: 'MISSING_OR_INVALID_PARAMETERS',
			validationErrors: expect.arrayContaining([expect.objectContaining({ fieldName: 'id' })]),
		});
	});
});
