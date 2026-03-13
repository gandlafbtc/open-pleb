import type { User } from 'common/db/schema';

class UsersState {
	private _users: User[];
	private _usedCodesCount: number;
	private _unusedCodesCount: number;
	private _isLoading: boolean;
	private _error: string | null;

	constructor() {
		this._users = $state([]);
		this._usedCodesCount = $state(0);
		this._unusedCodesCount = $state(0);
		this._isLoading = $state(false);
		this._error = $state(null);
	}

	get users(): User[] {
		return this._users;
	}

	set users(value: User[]) {
		this._users = value;
	}

	get isLoading(): boolean {
		return this._isLoading;
	}

	set isLoading(value: boolean) {
		this._isLoading = value;
	}

	get error(): string | null {
		return this._error;
	}

	set error(value: string | null) {
		this._error = value;
	}

	get usedCount(): number {
		return this._usedCodesCount;
	}

	set usedCount(value: number) {
		this._usedCodesCount = value;
	}

	get unusedCount(): number {
		return this._unusedCodesCount;
	}

	set unusedCount(value: number) {
		this._unusedCodesCount = value;
	}

	setUsers(users: User[]) {
		this._users = users;
	}

	clearError() {
		this._error = null;
	}

	reset() {
		this._users = [];
		this._isLoading = false;
		this._error = null;
	}
}

export const usersState = new UsersState();
