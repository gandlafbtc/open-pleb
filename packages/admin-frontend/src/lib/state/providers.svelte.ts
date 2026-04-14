import type { FiatProvider } from "common/db/schema";

class ProvidersState {
	providers = $state<FiatProvider[]>([]);
	isLoading = $state<boolean>(false);
	error = $state<string | null>(null);
}

export const providersState = new ProvidersState();
