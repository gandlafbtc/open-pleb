import { env } from '$env/dynamic/public';
import { backendUrl } from '$lib/state/dynamic/backendUrl.svelte';

const { PUBLIC_API_VERSION } = env;

export const getAppApiBaseUrl = (): string => {
	return `${backendUrl.url}/api/${PUBLIC_API_VERSION}`;
};
