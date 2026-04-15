import { sessionCountState, type SessionCounts } from '$lib/state/dynamic/sessionCount.svelte';
import { getAppApiBaseUrl } from './const';
import { socket } from '$lib/interface/ws/ws';
import { RoomIds } from 'common/ws-types';

// API Types
export interface GetSessionCountsResponse {
	success: boolean;
	data?: SessionCounts;
	error?: string;
}

// API Functions
async function getSessionCountsApi(): Promise<GetSessionCountsResponse> {
	const response = await fetch(`${getAppApiBaseUrl()}/sessions/counts`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to fetch session counts");
	}

	return response.json();
}

export class SessionCountService {
	private unsubscribeHandler?: () => void;

	/**
	 * Initialize the session count service
	 * Fetches the initial session counts and subscribes to WebSocket updates
	 */
	async init(): Promise<void> {
		try {
			await this.fetchSessionCounts();
			this.subscribeToGlobalRoom();
		} catch (error) {
			console.error('Failed to initialize session count service:', error);
		}
	}

	/**
	 * Subscribe to the global WebSocket room to receive sessions:update events
	 */
	private subscribeToGlobalRoom(): void {
		const globalRoom = RoomIds.global();
		
		// Subscribe to the global room
		socket.subscribe(globalRoom);
		
		// Register handler for sessions:update events
		this.unsubscribeHandler = socket.onSessionsUpdate((data) => {
			console.log('Received sessions:update event:', data);
			this.handleSessionsUpdate(data);
		});
		
		console.log('Subscribed to global room for session count updates');
	}

	/**
	 * Clean up subscriptions
	 */
	destroy(): void {
		if (this.unsubscribeHandler) {
			this.unsubscribeHandler();
			this.unsubscribeHandler = undefined;
		}
		
		// Unsubscribe from the global room
		socket.unsubscribe(RoomIds.global());
	}

	/**
	 * Fetch session counts from the API
	 */
	async fetchSessionCounts(): Promise<void> {
		try {
			const response = await getSessionCountsApi();

			if (response.success && response.data) {
				sessionCountState.setCounts(response.data);
			} else {
				throw new Error(response.error || 'Failed to fetch session counts');
			}
		} catch (error) {
			console.error('Failed to fetch session counts:', error);
			throw error;
		}
	}

	/**
	 * Handle session count updates (from WebSocket)
	 */
	handleSessionsUpdate(data: SessionCounts): void {
		sessionCountState.setCounts(data);
	}

	/**
	 * Get current session counts
	 */
	getCounts(): SessionCounts {
		return sessionCountState.counts;
	}
}

export const sessionCountService = new SessionCountService();
