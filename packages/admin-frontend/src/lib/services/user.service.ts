import { authState } from "$lib/state/auth.svelte";
import { usersState } from "$lib/state/users.svelte";
import type { User } from "common/db/schema";
import { ADMIN_API_BASE_URL } from "./const";


const getUsers = async (limit: number = 100, beforeCreatedAt?: number): Promise<{users: User[], usedCount: number, unusedCount:number}> => {
	const token = authState.token;
	if (!token) {
		throw new Error("Not authenticated");
	}

	const url = new URL(`${ADMIN_API_BASE_URL}/users`);
	url.searchParams.append("limit", limit.toString());
	if (beforeCreatedAt) {
		url.searchParams.append("beforeCreatedAt", beforeCreatedAt.toString());
	}

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch users");
	}

	return await response.json();
};

export const loadUsers = async (limit: number = 100, beforeCreatedAt?: number): Promise<void> => {
	usersState.isLoading = true;
	usersState.error = null;

	try {
		const fetchedUsers = await getUsers(limit, beforeCreatedAt);
		usersState.users = fetchedUsers.users;
		usersState.usedCount = fetchedUsers.usedCount;
		usersState.unusedCount = fetchedUsers.unusedCount;
	} catch (err) {
		usersState.error = err instanceof Error ? err.message : 'Failed to load users';
		console.error('Load users error:', err);
	} finally {
		usersState.isLoading = false;
	}
};
