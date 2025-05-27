import { env} from '$env/dynamic/public';
import { writable } from 'svelte/store';

const { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } = env;
const createPriceStore = () => {
	const store = writable<number>(0);
	const refresh = async () => {
		try {
			const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/conversion`);
			const data = await response.json();
			store.set(data.conversion);
		} catch (error) {
			console.error(error);
		}
	};
	return { ...store, refresh };
};

export const priceStore = createPriceStore();
