import Joi from 'joi';

import { ErrorCodes, ValidationError, type IValidationError } from '../errors/index.js';

export interface RequestSchema {
	params?: Joi.ObjectSchema;
	query?: Joi.ObjectSchema;
	headers?: Joi.ObjectSchema;
	body?: Joi.ObjectSchema;
}

type InferPartType<T> = T extends Joi.ObjectSchema<infer U> ? U : never;

export type InferSchemaType<T extends RequestSchema> = {
	[K in keyof T]: InferPartType<T[K]>;
};

export class SchemaValidator<T extends RequestSchema> {
	constructor(private readonly schema: T) {}

	private collectPartErrors(partSchema: Joi.ObjectSchema, data: unknown, errors: IValidationError[]): unknown {
		const { error, value } = partSchema.validate(data, { abortEarly: false, stripUnknown: true });
		if (error) {
			error.details.forEach(d => {
				errors.push({
					fieldName: (d.context?.key ?? '') as string,
					friendlyFieldName: (d.context?.label ?? '') as string,
					message: d.message,
				});
			});
		}
		return value;
	}

	validate(req: { params?: unknown; query?: unknown; headers?: unknown; body?: unknown }): InferSchemaType<T> {
		const errors: IValidationError[] = [];
		const result: Record<string, unknown> = {};

		const parts = ['params', 'query', 'headers', 'body'] as const;
		for (const part of parts) {
			const partSchema = this.schema[part];
			if (partSchema) {
				result[part] = this.collectPartErrors(partSchema, req[part], errors);
			}
		}

		if (errors.length > 0) {
			throw new ValidationError(errors, ErrorCodes.MISSING_OR_INVALID_PARAMETERS);
		}

		return result as InferSchemaType<T>;
	}
}
