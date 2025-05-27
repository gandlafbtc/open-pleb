import { get } from "svelte/store";
import { reconnectWebSocket, userLoggedIn } from "./stores/user";
import { goto } from "$app/navigation";
import { dataStore } from "./stores/data.svelte";

export const init = async () => {
    const user = get(userLoggedIn)
    if (!user) {
        goto("/login");
        return
    }
};

export const initAuthed = async () => {
    try {
        await dataStore.init()
        reconnectWebSocket()
    }
    catch (error) {
        console.error(error);
    }
};

