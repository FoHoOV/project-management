import { defineConfig, configDefaults } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	test: {
		include: ['src/**/*.(test).{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['vitest-setup.ts'],
		// Exclude playwright tests folder
		exclude: [...configDefaults.exclude, 'tests']
	}
});
