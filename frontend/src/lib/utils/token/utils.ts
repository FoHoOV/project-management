import { type JWTPayload, decodeJwt } from 'jose';

export function isTokenExpired(token: string) {
	try {
		const { exp } = decodeJwt(token);
		return exp === undefined || exp * 1000 < Date.now();
	} catch {
		return true;
	}
}

export function getUsername(token: string) {
	const parsedToken: JWTPayload = decodeJwt(token);

	if (!parsedToken.sub) {
		throw new Error("username doesn't exist in the token");
	}

	return parsedToken.sub as string;
}
