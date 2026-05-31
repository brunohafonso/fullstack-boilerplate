import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importHelpers from 'eslint-plugin-import-helpers';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist/**', 'node_modules/**', 'src/generated/**'] },
	js.configs.recommended,
	tseslint.configs.recommended,
	prettierConfig,
	{
		plugins: {
			prettier: prettierPlugin,
			'import-helpers': importHelpers,
			'unused-imports': unusedImports,
		},
		languageOptions: {
			globals: {
				...globals.node,
				...globals.es2022,
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		rules: {
			'unused-imports/no-unused-imports': 'error',
			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': 'error',
			'no-console': 'error',
			'consistent-return': 'off',
			'no-use-before-define': ['error', { functions: false }],
			'prettier/prettier': 'error',
			'arrow-body-style': 'off',
			'function-paren-newline': 'off',
			complexity: ['warn', 8],
			'max-statements': ['warn', { max: 15 }],
			'max-statements-per-line': ['warn', { max: 1 }],
			'max-nested-callbacks': ['warn', { max: 2 }],
			'max-depth': ['warn', { max: 2 }],
			'max-params': ['warn', 5],
			'max-len': ['warn', 120, { ignoreUrls: true, ignoreComments: true, ignoreStrings: true }],
			'no-param-reassign': [
				'warn',
				{
					props: true,
					ignorePropertyModificationsFor: [
						'acc',
						'accumulator',
						'item',
						'e',
						'module',
						'req',
						'request',
						'res',
						'response',
						'session',
					],
				},
			],
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-empty-interface': 'off',
			'no-useless-constructor': 'off',
			'class-methods-use-this': 'off',
			'import-helpers/order-imports': [
				'warn',
				{
					newlinesBetween: 'always',
					groups: ['module', ['parent', 'sibling', 'index']],
					alphabetize: { order: 'asc', ignoreCase: true },
				},
			],
		},
	},
	{
		files: ['src/**/__tests__/**/*.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts'],
		rules: {
			'max-nested-callbacks': 'off',
			'max-statements': 'off',
		},
	},
);
