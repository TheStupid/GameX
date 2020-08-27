export default class Dictionary<K, V> {

	private _keys: K[] = [];
	private _values: V[] = [];

	public constructor() {
	}

	public getValue(key: K): V {
		var index = this._keys.indexOf(key);
		return index < 0 ? null : this._values[index];
	}

	public setValue(key: K, value: V): V {
		var index = this._keys.indexOf(key);
		if (index >= 0) {
			this._values[index] = value;
			return;
		}
		this._keys.push(key);
		this._values.push(value);
		return value;
	}

	public remove(key: K): V {
		var index = this._keys.indexOf(key);
		if (index >= 0) {
			this._keys.splice(index, 1);
			return this._values.splice(index, 1)[0];
		}
		return null;
	}

	public getKeyIndex(key: K): number {
		return this._keys.indexOf(key);
	}

    public getKey(value: V): K {
		var valueIndex:number = this._values.indexOf(value);
		if(valueIndex==-1){
			return null;
		}else {
            return this._keys[valueIndex];
        }
    }

	public keys(): K[] {
		return this._keys.slice();
	}

	public values(): V[] {
		return this._values.slice();
	}

	public forEach(callback: (key: K, value: V) => any, thisArg: any = null): void {
		for (var index in this._keys) {
			callback.call(thisArg, this._keys[index], this._values[index]);
		}
	}

	public containsKey(key: K): boolean {
		return this._keys.indexOf(key) != -1;
	}

	public clear() {
		this._keys.length = 0;
		this._values.length = 0;
	}

	public size(): number {
		return this._keys.length;
	}
}