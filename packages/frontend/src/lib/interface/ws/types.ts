/**
 * Client-side WebSocket types
 */

import type {
	WSClientMessage,
	PongData,
	SubscribedData,
	UnsubscribedData,
	ErrorData,
	OfferUpdatedData
} from "common/ws-types";

/**
 * Typed message handlers for specific message types
 */
export type PongHandler = (data: PongData) => void;
export type SubscribedHandler = (data: SubscribedData) => void;
export type UnsubscribedHandler = (data: UnsubscribedData) => void;
export type ErrorHandler = (data: ErrorData) => void;
export type UpdateHandler = (data: OfferUpdatedData) => void;

/**
 * Connection event handlers
 */
export type ConnectionHandler = () => void;

/**
 * WebSocket client interface
 */
export interface WSClient {
	// Connection methods
	connect(): void;
	close(): void;
	
	// Send methods
	send(message: WSClientMessage): void;
	subscribe(room: string, auth?: { bat?: string; jwt?: string }): void;
	unsubscribe(room: string): void;
	ping(timestamp?: number): void;
	
	// Event handlers
	onPong(handler: PongHandler): () => void;
	onSubscribed(handler: SubscribedHandler): () => void;
	onUnsubscribed(handler: UnsubscribedHandler): () => void;
	onError(handler: ErrorHandler): () => void;
	onUpdate(handler: UpdateHandler): () => void;
	onOpen(handler: ConnectionHandler): () => void;
	onClose(handler: ConnectionHandler): () => void;
	
	// State
	readonly isConnected: boolean;
	readonly readyState: number;
}
