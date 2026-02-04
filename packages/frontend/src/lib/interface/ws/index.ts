/**
 * WebSocket client interface
 * Exports the singleton WebSocket client and related types
 */

export { socket } from "./ws";
export type {
	WSClient,
	PongHandler,
	SubscribedHandler,
	UnsubscribedHandler,
	ErrorHandler,
	UpdateHandler,
	ConnectionHandler
} from "./types";
