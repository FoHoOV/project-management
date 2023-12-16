import type { NumberRange } from '$lib/utils/types';

export function convertNumberToHttpStatusCode(number: number): NumberRange<400, 600> {
	return number >= 400 && number < 600 ? (number as NumberRange<400, 600>) : 500;
}
