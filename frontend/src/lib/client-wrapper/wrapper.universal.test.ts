import { describe, expect, it, vi } from 'vitest';
import { ErrorCode } from '#lib/generated-client/index.js';
import { ApiError } from './clients';
import { callService, ErrorType } from './wrapper.universal';

vi.mock('$app/env/public', () => ({ PUBLIC_API_REQUEST_TIMEOUT_MS: '1000' }));

function failWith(body: unknown, status: number) {
	return callService({
		call: async () => {
			throw new ApiError(body, new Response(null, { status }));
		},
		errorHandler: async (e) => e
	});
}

describe('callService', () => {
	it('uses a generic message when the error body is not JSON', async () => {
		const result = await failWith('Internal Server Error', 500);

		expect(result).toMatchObject({
			success: false,
			error: {
				type: ErrorType.API_ERROR,
				status: 500,
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'An unexpected error has occurred, please try again'
			}
		});
	});

	it('uses the validation message for a 422 without an error schema', async () => {
		const result = await failWith(
			{ detail: [{ loc: ['body', 'name'], msg: 'Field required', type: 'missing' }] },
			422
		);

		expect(result).toMatchObject({
			success: false,
			error: {
				type: ErrorType.API_ERROR,
				status: 422,
				message: 'Some validation errors has ocurred, please review you inputs'
			}
		});
	});
});
