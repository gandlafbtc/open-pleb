import { authState } from "$lib/state/auth.svelte";
import { providersState } from "$lib/state/providers.svelte";
import type { FiatProvider } from "common/db/schema";
import { ADMIN_API_BASE_URL } from "./const";

const getProviders = async (): Promise<FiatProvider[]> => {
	const token = authState.token;
	if (!token) {
		throw new Error("Not authenticated");
	}

	const response = await fetch(`${ADMIN_API_BASE_URL}/providers`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch providers");
	}

	return await response.json();
};

const getProvider = async (id: number): Promise<FiatProvider> => {
	const token = authState.token;
	if (!token) {
		throw new Error("Not authenticated");
	}

	const response = await fetch(`${ADMIN_API_BASE_URL}/providers/${id}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch provider");
	}

	return await response.json();
};

const createProvider = async (provider: { label: string; icon: string; matchTemplate?: string }): Promise<FiatProvider> => {
	const token = authState.token;
	if (!token) {
		throw new Error("Not authenticated");
	}

	const response = await fetch(`${ADMIN_API_BASE_URL}/providers`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(provider),
	});

	if (!response.ok) {
		throw new Error("Failed to create provider");
	}

	return await response.json();
};

const updateProvider = async (id: number, provider: { label?: string; icon?: string; matchTemplate?: string }): Promise<FiatProvider> => {
	const token = authState.token;
	if (!token) {
		throw new Error("Not authenticated");
	}

	const response = await fetch(`${ADMIN_API_BASE_URL}/providers/${id}`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(provider),
	});

	if (!response.ok) {
		throw new Error("Failed to update provider");
	}

	return await response.json();
};

const deleteProvider = async (id: number): Promise<void> => {
	const token = authState.token;
	if (!token) {
		throw new Error("Not authenticated");
	}

	const response = await fetch(`${ADMIN_API_BASE_URL}/providers/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to delete provider");
	}
};

export const loadProviders = async (): Promise<void> => {
	providersState.isLoading = true;
	providersState.error = null;

	try {
		const fetchedProviders = await getProviders();
		providersState.providers = fetchedProviders;
	} catch (err) {
		providersState.error = err instanceof Error ? err.message : 'Failed to load providers';
		console.error('Load providers error:', err);
	} finally {
		providersState.isLoading = false;
	}
};

export const loadProvider = async (id: number): Promise<FiatProvider | null> => {
	try {
		return await getProvider(id);
	} catch (err) {
		console.error('Load provider error:', err);
		return null;
	}
};

export const saveProvider = async (provider: { label: string; icon: string; matchTemplate?: string }): Promise<FiatProvider | null> => {
	try {
		return await createProvider(provider);
	} catch (err) {
		console.error('Create provider error:', err);
		throw err;
	}
};

export const updateProviderById = async (id: number, provider: { label?: string; icon?: string; matchTemplate?: string }): Promise<FiatProvider | null> => {
	try {
		return await updateProvider(id, provider);
	} catch (err) {
		console.error('Update provider error:', err);
		throw err;
	}
};

export const deleteProviderById = async (id: number): Promise<void> => {
	try {
		await deleteProvider(id);
	} catch (err) {
		console.error('Delete provider error:', err);
		throw err;
	}
};
