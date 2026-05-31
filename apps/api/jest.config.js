/** @type {import('jest').Config} */
export default {
	testMatch: ['**/__tests__/**/*.spec.ts'],
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: {
					module: 'NodeNext',
					moduleResolution: 'NodeNext',
					verbatimModuleSyntax: false,
					isolatedModules: true,
				},
			},
		],
	},
};
