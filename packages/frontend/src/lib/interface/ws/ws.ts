import { env } from "$env/dynamic/public";
import { WS_COMMAND, type WSClientMessage, type WSMessage } from "common/ws-types";
import { MessageHandlerRegistry } from "./handlers";
import type { WSClient, ConnectionHandler } from "./types";
import { browser } from "$app/environment";

const { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } = env;

class ReconnectingWebSocket implements WSClient {
	private ws: WebSocket | null = null;
	private url: string;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 10;
	private reconnectDelay = 1000;
	private reconnectDelayMax = 30000;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	private heartbeatInterval = 30000; // 30 seconds
	private shouldReconnect = true;

	private registry = new MessageHandlerRegistry();
	private openHandlers: Set<ConnectionHandler> = new Set();
	private closeHandlers: Set<ConnectionHandler> = new Set();

	constructor(url: string) {
		this.url = url;
		this.connect();
	}

	connect() {
    if (!browser) return
		try {
			console.log(`Connecting to WebSocket: ${this.url}`);
			this.ws = new WebSocket(this.url);

			this.ws.onopen = () => {
				console.log("✅ WebSocket connected");
				this.reconnectAttempts = 0;
				this.startHeartbeat();
				this.openHandlers.forEach((handler) => handler());
			};

			this.ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data) as WSMessage;
					this.registry.handle(message);
				} catch (error) {
					console.error("Error parsing WebSocket message:", error);
				}
			};

			this.ws.onerror = (error) => {
				console.error("WebSocket error:", error);
			};

			this.ws.onclose = (event) => {
				console.log(
					`WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`
				);
				this.stopHeartbeat();
				this.closeHandlers.forEach((handler) => handler());

				if (this.shouldReconnect) {
					this.scheduleReconnect();
				}
			};
		} catch (error) {
			console.error("Error creating WebSocket:", error);
			if (this.shouldReconnect) {
				this.scheduleReconnect();
			}
		}
	}

	private scheduleReconnect() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}

		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error("Max reconnection attempts reached");
			return;
		}

		this.reconnectAttempts++;
		const delay = Math.min(
			this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
			this.reconnectDelayMax
		);

		console.log(
			`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
		);

		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, delay);
	}

	private startHeartbeat() {
		this.stopHeartbeat();
		this.heartbeatTimer = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.ping();
			}
		}, this.heartbeatInterval);
	}

	private stopHeartbeat() {
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}
	}

	send(message: WSClientMessage) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		} else {
			console.warn("WebSocket is not connected. Message not sent:", message);
		}
	}

	subscribe(room: string, auth?: { bat?: string; jwt?: string }) {
		this.send({
			type: WS_COMMAND.SUBSCRIBE,
			data: { room, ...auth }
		});
	}

	unsubscribe(room: string) {
		this.send({
			type: WS_COMMAND.UNSUBSCRIBE,
			data: { room }
		});
	}

	ping(timestamp?: number) {
		this.send({
			type: WS_COMMAND.PING,
			data: { timestamp: timestamp ?? Date.now() }
		});
	}

	// Handler registration methods
	onPong(handler: Parameters<MessageHandlerRegistry["onPong"]>[0]) {
		return this.registry.onPong(handler);
	}

	onSubscribed(handler: Parameters<MessageHandlerRegistry["onSubscribed"]>[0]) {
		return this.registry.onSubscribed(handler);
	}

	onUnsubscribed(handler: Parameters<MessageHandlerRegistry["onUnsubscribed"]>[0]) {
		return this.registry.onUnsubscribed(handler);
	}

	onError(handler: Parameters<MessageHandlerRegistry["onError"]>[0]) {
		return this.registry.onError(handler);
	}

	onUpdate(handler: Parameters<MessageHandlerRegistry["onUpdate"]>[0]) {
		return this.registry.onUpdate(handler);
	}

	onOfferListed(handler: Parameters<MessageHandlerRegistry["onOfferListed"]>[0]) {
		return this.registry.onOfferListed(handler);
	}

	onOpen(handler: ConnectionHandler) {
		this.openHandlers.add(handler);
		return () => this.openHandlers.delete(handler);
	}

	onClose(handler: ConnectionHandler) {
		this.closeHandlers.add(handler);
		return () => this.closeHandlers.delete(handler);
	}

	close() {
		this.shouldReconnect = false;
		this.stopHeartbeat();
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}
		if (this.ws) {
			this.ws.close();
		}
		this.registry.clear();
	}

	get readyState(): number {
		return this.ws?.readyState ?? WebSocket.CLOSED;
	}

	get isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN;
	}
}

// Create WebSocket URL
const wsUrl =
	PUBLIC_BACKEND_URL.replace(/^http/, "ws") + `/ws/${PUBLIC_API_VERSION}`;

// Export singleton instance
export const socket = new ReconnectingWebSocket(wsUrl);
