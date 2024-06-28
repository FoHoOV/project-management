import { browser } from '$app/environment';
import ClientCookies from 'js-cookie';

type Options = {
	expires?: Date;
	path: string;
	/**
	 * forcing consumers to set httpOnly to false, so that they are aware this is none-http-only cookie
	 */
	httpOnly: false;
};

/**
 * nothing is httpOnly here because its a shared module between ssr/csr
 */
export class Cookies {
	#serverSideCookies = new Map<string, { value: string; opts: Options & { modified: boolean } }>();

	set(name: string, value: string, opts: Options) {
		if (browser) {
			ClientCookies.set(name, value, opts);
			return;
		}
		throw new Error('cookies.set is not implemented for server-side yet');
		// in hooks.server.ts we should write all modified serverSideCookies, but how to get a reference to this instance there?
		// god knows :D
		// this.#serverSideCookies.set(name, { value, opts: { ...opts, modified: true } });
	}

	get(name: string): string | undefined {
		if (browser) {
			return ClientCookies.get(name);
		}
		return this.#serverSideCookies.get(name)?.value;
	}

	getAll() {
		if (browser) {
			return ClientCookies.get();
		}
		return Array.from(this.#serverSideCookies.values()).map((v) => v.value);
	}

	/**
	 * only works in server-side
	 */
	getAllWithOptions() {
		if (browser) {
			throw new Error('this function only works in server-side');
		}
		return this.#serverSideCookies;
	}

	/**
	 * populates the cookies from `values`.
	 * in server-side it will mark these cookies as none-modified, so they will not be written to the response
	 */
	from(values: { value: string; name: string }[], expires?: Date) {
		values.forEach((v) => {
			if (browser) {
				this.set(v.name, v.value, {
					path: '/',
					httpOnly: false,
					expires: expires
				});
			} else {
				this.#serverSideCookies.set(v.name, {
					value: v.value,
					opts: {
						path: '/',
						httpOnly: false,
						modified: false,
						expires: expires
					}
				});
			}
		});
	}
}
