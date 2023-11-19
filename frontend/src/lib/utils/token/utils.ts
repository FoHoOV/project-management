import { type JWTPayload, decodeJwt } from 'jose';
import { TokenError } from './token-errors';

export async function isTokenExpirationDateValidAsync(token?: string) {
	if (!token) {
		return false;
	}
	try {
		const parsedToken: JWTPayload = decodeJwt(token);
		if (!parsedToken.exp) {
			throw new TokenError('expiration date not found in jwt');
		}
		if (parsedToken.exp * 1000 < Date.now()) {
			return false;
		}
	} catch {
		return false;
	}

	return true;
}
