import { browser } from '$app/environment';
import Cookies from 'js-cookie';

type CookieManager = {
	set: (key: string, value: string, opts: { expires?: Date; path: string }) => void;
	get: (key: string) => string | undefined;
};

/**
 * the purpose of this module to be ssr compliant of storage types that differ in ssr/csr
 */
export class StorageTypes {
	static _cookieManager: CookieManager | null = null;

	/**
	 * nothing is httpOnly here because its a shared module between ssr/csr
	 */
	static get cookies() {
		if (!this._cookieManager && browser) {
			this._cookieManager = {
				get: Cookies.get,
				set: Cookies.set
			};
		}

		if (!this._cookieManager) {
			throw new Error('StorageTypes.cookies before assigning it a value');
		}

		return this._cookieManager;
	}

	static set cookieManager(cookieManager: CookieManager) {
		this._cookieManager = cookieManager;
	}

	static get localStorage() {
		return browser
			? window.localStorage
			: {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					getItem(key: string) {
						return null;
					},
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					setItem(key: string, value: string | null) {}
				};
	}
}
