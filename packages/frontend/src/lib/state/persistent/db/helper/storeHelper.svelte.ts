import type { EncryptionHelper } from './encryptionHelper';

export class DefaultStore<T> {
	protected encryptionHelper: EncryptionHelper<T>;
	protected _data: T[] = $state([]);

	get data(): T[] {
		return this._data;
	}

	constructor(encryptionHelper: EncryptionHelper<T>) {
		this.encryptionHelper = encryptionHelper;
	}

	async init(): Promise<void> {
		try {
			const all = await this.encryptionHelper.decrypt();
			if (all?.length === 0) {
				this._data = [];
				return;
			}
			this._data = all;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async reEncrypt(): Promise<void> {
		await this.encryptionHelper.encrypt(this._data);
	}

	async reset(): Promise<void> {
		this._data = [];
		await this.encryptionHelper.encrypt(this._data);
	}

	clear(): void {
		this._data = [];
	}

	async remove(id: string, idFieldDescr: keyof T): Promise<void> {
		this._data = this._data.filter((o) => o[idFieldDescr] !== id);
		await this.encryptionHelper.encrypt(this._data);
	}

	async addOrUpdateMany(elements: T[], idFieldDescr: keyof T): Promise<void> {
		for (const element of elements) {
			if (this._data.find((o) => o[idFieldDescr] === element[idFieldDescr])) {
				this._data = this._data.map((o) =>
					o[idFieldDescr] === element[idFieldDescr] ? element : o
				);
			} else {
				this._data = [element, ...this._data];
			}
		}
		await this.encryptionHelper.encrypt(this._data);
	}

	async addOrUpdate(id: string, element: T, idFieldDescr: keyof T): Promise<void> {
		if (this._data.find((o) => o[idFieldDescr] === id)) {
			this._data = this._data.map((o) => (o[idFieldDescr] === id ? element : o));
		} else {
			this._data = [element, ...this._data];
		}
		await this.encryptionHelper.encrypt(this._data);
	}

	async addMany(elements: T[]): Promise<void> {
		this._data = [...elements, ...this._data];
		await this.encryptionHelper.encrypt(this._data);
	}

	async add(o: T): Promise<void> {
		this._data = [o, ...this._data];
		await this.encryptionHelper.encrypt(this._data);
	}

	async removeMany(ids: string[], idFieldDescr: keyof T): Promise<void> {
		this._data = this._data.filter((o) => !ids.includes(o[idFieldDescr] as string));
		await this.encryptionHelper.encrypt(this._data);
	}

	getBy(id: string, idFieldDescr: keyof T): T | undefined {
		return this._data.find((o) => o[idFieldDescr] === id);
	}

	getAllBy(ids: string[], idFieldDescr: keyof T): T[] {
		return this._data.filter((o) => {
			return ids.includes(o[idFieldDescr] as string);
		});
	}
}

export const getBy = <T>(array: T[], id: string, idFieldDescr: keyof T): T | undefined => {
	return array.find((o) => o[idFieldDescr] === id);
};

export const getByMany = <T>(array: T[], id: string[], idFieldDescr: keyof T): T[] => {
	return array.filter((o) => id.includes(o[idFieldDescr] as string));
};
