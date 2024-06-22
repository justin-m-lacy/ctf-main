interface Store<T extends object> {

	elm: T | null,
	reset: () => void,
	creator: () => T,
	get: () => T

}

const stores = new Map<string, Store<object>>();


export function defineBasicStore<T extends object>(name: string, creator: () => T) {

	const store: Store<T> = {

		creator: creator,
		elm: null,
		reset() {
			this.elm = null;
		},
		get() {
			return this.elm ?? (this.elm = this.creator());
		}

	};

	stores.set(name, store);

	return () => {

		return store.get();

	};

}


export function resetStore(name: string) {

	stores.get(name)?.reset();

}