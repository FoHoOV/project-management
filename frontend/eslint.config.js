import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				svelteConfig
			}
		}
	},
	{
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.spec.ts', '.test.ts']
			}
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-unused-expressions': 'off',
			'@typescript-eslint/no-unused-expressions': 'off'
		}
	},
	{
		files: ['**/*.ts', '**/*.svelte'],
		rules: {
			// TypeScript already reports undefined names, and no-undef can't see Svelte `generics` type params:
			// https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/', '.vercel', 'src/lib/generated-client/']
	}
);
