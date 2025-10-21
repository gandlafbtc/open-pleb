import { ensureError } from "$lib/errors";
import { toast } from "svelte-sonner";
import { get, writable } from "svelte/store";
import type { FiatProvider } from "@openPleb/common/db/schema";
import { env } from "$env/dynamic/public";
import { userLoggedIn } from "./user";

const { PUBLIC_BACKEND_URL, PUBLIC_API_VERSION } = env

type FiatProviderState = {
  providers: FiatProvider[];
  loading: boolean;
  error: string | null;
};

const createFiatProviderStore = () => {
  const initialState: FiatProviderState = {
    providers: [],
    loading: false,
    error: null,
  };

  const { subscribe, set, update } = writable<FiatProviderState>(initialState);

  const fetchProviders = async () => {
    update((state) => ({ ...state, loading: true, error: null }));
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/fiat-providers`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch fiat providers");
      }

      update((state) => ({
        ...state,
        providers: data.data,
        loading: false,
      }));
    } catch (error) {
      const err = ensureError(error);
      update((state) => ({
        ...state,
        error: err.message,
        loading: false,
      }));
      toast.error(`Error fetching fiat providers: ${err.message}`);
    }
  };

  const addProvider = async (provider: { label: string; icon: string; matchTemplate?: string }) => {
    update((state) => ({ ...state, loading: true, error: null }));
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/admin/fiat-providers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${get(userLoggedIn)?.access_token}`,
        },
        body: JSON.stringify(provider),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to add fiat provider");
      }

      update((state) => ({
        ...state,
        providers: [...state.providers, data.data],
        loading: false,
      }));
      toast.success("Fiat provider added successfully");
      return true;
    } catch (error) {
      const err = ensureError(error);
      update((state) => ({
        ...state,
        error: err.message,
        loading: false,
      }));
      toast.error(`Error adding fiat provider: ${err.message}`);
      return false;
    }
  };

  const updateProvider = async (
    id: number,
    updates: { label?: string; icon?: string; matchTemplate?: string }
  ) => {
    update((state) => ({ ...state, loading: true, error: null }));
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/admin/fiat-providers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${get(userLoggedIn)?.access_token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update fiat provider");
      }

      update((state) => ({
        ...state,
        providers: state.providers.map((provider) =>
          provider.id === id ? data.data : provider
        ),
        loading: false,
      }));
      toast.success("Fiat provider updated successfully");
      return true;
    } catch (error) {
      const err = ensureError(error);
      update((state) => ({
        ...state,
        error: err.message,
        loading: false,
      }));
      toast.error(`Error updating fiat provider: ${err.message}`);
      return false;
    }
  };

  const deleteProvider = async (id: number) => {
    update((state) => ({ ...state, loading: true, error: null }));
    try {
      const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/admin/fiat-providers${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${get(userLoggedIn)?.access_token}`

        }
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete fiat provider");
      }

      update((state) => ({
        ...state,
        providers: state.providers.filter((provider) => provider.id !== id),
        loading: false,
      }));
      toast.success("Fiat provider deleted successfully");
      return true;
    } catch (error) {
      const err = ensureError(error);
      update((state) => ({
        ...state,
        error: err.message,
        loading: false,
      }));
      toast.error(`Error deleting fiat provider: ${err.message}`);
      return false;
    }
  };

  return {
    subscribe,
    fetchProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    reset: () => set(initialState),
  };
};

export const fiatProvidersStore = createFiatProviderStore();
