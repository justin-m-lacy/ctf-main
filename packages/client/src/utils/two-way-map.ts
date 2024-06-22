class BiMap<K = string, V = any> {

    private readonly _map: Map<K, V> = new Map();
    private readonly reverse: Map<V, K> = new Map();

    get size() { return this._map.size }

    set(key: K, v: V) {
        this._map.set(key, v);
        this.reverse.set(v, key);
    }

    clear() {
        this._map.clear();
        this.reverse.clear();
    }

    get(key: K,) {
        return this._map.get(key);
    }

    getKey(v: V) {
        return this.reverse.get(v);
    }

    delete(k: K) {

        const v = this._map.get(k);
        this._map.delete(k);
        if (v !== undefined) {
            this.reverse.delete(v);
        }

    }

}