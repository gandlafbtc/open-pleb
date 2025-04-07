import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } from '$env/static/public';
import { writable } from 'svelte/store';

const createPriceStore = () => {
	const store = writable<number>(0);
	const refresh = async () => {
		try {
			const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/conversion`);
			const data = await response.json();
			console.log(response);
			store.set(data.conversion);
		} catch (error) {
			console.error(error);
		}
	};
	return { ...store, refresh };
};

export const priceStore = createPriceStore();
