import { expect, test, vi, describe, beforeEach } from 'vitest';
import { LocalStorage } from './local-storage';
import * as environment from '$app/environment';

describe.each([
	{ isBrowser: true },
	{ isBrowser: false }
])('LocalStorage in environment context', ({ isBrowser }) => {
	beforeEach(() => {
		vi.spyOn(environment, 'browser', 'get').mockReturnValue(isBrowser);
	});

	test(`${isBrowser ? 'browser' : 'server'}: correctly sets and retrieves items`, () => {
		const storage = new LocalStorage();
		storage.setItem('test', "value");
		expect(storage.getItem('test')).toEqual('value');
	});
});
