export class ContextManager {
	private _contexts: Record<any, unknown> = $state({});

	add<TContext>(key: any, value: TContext) {
		this._contexts[key] = value;
		return value;
	}

	delete(key: any) {
		delete this._contexts[key];
	}

	get<TContext>(key: any) {
		return this._contexts[key] as TContext;
	}

	get$<TContext>(key: any) {
		const self = this;
		return {
			get value$() {
				return self._contexts[key] as TContext;
			}
		};
	}
}
