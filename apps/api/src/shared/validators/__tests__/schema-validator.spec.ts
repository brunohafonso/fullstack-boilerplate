import { describe, expect, it } from '@jest/globals';
import Joi from 'joi';

import { ValidationError } from '../../errors/index.js';
import { SchemaValidator } from '../schema-validator.js';

const bodyOnlySchema = {
	body: Joi.object({
		name: Joi.string().required(),
		email: Joi.string().email().required(),
	}),
};

const paramsOnlySchema = {
	params: Joi.object({ id: Joi.number().integer().positive().required() }),
};

const multiPartSchema = {
	params: Joi.object({ id: Joi.number().integer().positive().required() }),
	body: Joi.object({ name: Joi.string().required() }),
};

describe('SchemaValidator', () => {
	describe('validate', () => {
		describe('when the request is valid', () => {
			it('returns the validated body', () => {
				const req = { body: { name: 'Alice', email: 'alice@example.com' } };

				const result = new SchemaValidator(bodyOnlySchema).validate(req);

				expect(result.body).toEqual({ name: 'Alice', email: 'alice@example.com' });
			});

			it('returns the validated params', () => {
				const req = { params: { id: 42 } };

				const result = new SchemaValidator(paramsOnlySchema).validate(req);

				expect(result.params).toEqual({ id: 42 });
			});

			it('coerces string params to numbers', () => {
				const req = { params: { id: '7' } };

				const result = new SchemaValidator(paramsOnlySchema).validate(req);

				expect(result.params).toEqual({ id: 7 });
			});

			it('strips unknown keys from the body', () => {
				const req = { body: { name: 'Alice', email: 'alice@example.com', role: 'admin' } };

				const result = new SchemaValidator(bodyOnlySchema).validate(req);

				expect(result.body).not.toHaveProperty('role');
			});

			it('validates multiple parts and returns all of them', () => {
				const req = { params: { id: 1 }, body: { name: 'Alice' } };

				const result = new SchemaValidator(multiPartSchema).validate(req);

				expect(result.params).toEqual({ id: 1 });
				expect(result.body).toEqual({ name: 'Alice' });
			});

			it('ignores parts not defined in the schema', () => {
				const req = { params: { id: 1 }, body: { name: 'Alice' }, query: { page: '1' } };

				const result = new SchemaValidator(paramsOnlySchema).validate(req);

				expect(result).not.toHaveProperty('query');
			});
		});

		describe('when the request is invalid', () => {
			it('throws ValidationError for a missing required field', () => {
				const req = { body: { name: 'Alice' } };

				expect(() => new SchemaValidator(bodyOnlySchema).validate(req)).toThrow(ValidationError);
			});

			it('throws ValidationError for an invalid email', () => {
				const req = { body: { name: 'Alice', email: 'not-an-email' } };

				expect(() => new SchemaValidator(bodyOnlySchema).validate(req)).toThrow(ValidationError);
			});

			it('collects all field errors in a single throw (abortEarly: false)', () => {
				const req = { body: {} };

				try {
					new SchemaValidator(bodyOnlySchema).validate(req);
					expect.fail('should have thrown');
				} catch (err) {
					expect(err).toBeInstanceOf(ValidationError);
					const validationErr = err as ValidationError;
					expect(validationErr.validationErrors.length).toBeGreaterThanOrEqual(2);
				}
			});

			it('includes fieldName and message on each error', () => {
				const req = { body: { name: 'Alice', email: 'bad' } };

				try {
					new SchemaValidator(bodyOnlySchema).validate(req);
					expect.fail('should have thrown');
				} catch (err) {
					const validationErr = err as ValidationError;
					const emailError = validationErr.validationErrors.find(e => e.fieldName === 'email');

					expect(emailError).toBeDefined();
					expect(emailError?.message).toEqual(expect.any(String));
				}
			});

			it('collects errors from multiple parts', () => {
				const req = { params: { id: -1 }, body: {} };

				try {
					new SchemaValidator(multiPartSchema).validate(req);
					expect.fail('should have thrown');
				} catch (err) {
					const validationErr = err as ValidationError;

					expect(validationErr.validationErrors.length).toBeGreaterThanOrEqual(2);
				}
			});

			it('throws ValidationError with the correct code', () => {
				const req = { body: {} };

				try {
					new SchemaValidator(bodyOnlySchema).validate(req);
					expect.fail('should have thrown');
				} catch (err) {
					const validationErr = err as ValidationError;

					expect(validationErr.code).toBe('MISSING_OR_INVALID_PARAMETERS');
				}
			});
		});
	});
});
