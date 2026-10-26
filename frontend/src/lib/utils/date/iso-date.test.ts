import { describe, expect, test } from 'vitest';
import { fromIsoDate, toIsoDate } from './iso-date';

describe('iso dates', () => {
	test('toIsoDate uses the local calendar date', () => {
		expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
	});

	test('fromIsoDate returns local midnight of that day', () => {
		const date = fromIsoDate('2026-10-20');
		expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
			2026, 9, 20, 0
		]);
	});

	test('round-trips', () => {
		expect(toIsoDate(fromIsoDate('2026-02-28'))).toBe('2026-02-28');
	});
});
