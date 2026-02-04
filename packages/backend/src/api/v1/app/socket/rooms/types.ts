import type { ServerWebSocket } from "bun";

/**
 * Room types in the system
 */
export const ROOM_TYPE = {
	OFFER: "offer",
	GLOBAL: "global",
	ADMIN: "admin"
} as const;

export type RoomType = typeof ROOM_TYPE[keyof typeof ROOM_TYPE];

/**
 * Room authorization check function
 * Returns true if the WebSocket is authorized to access the room
 */
export type RoomAuthCheck = (
	ws: ServerWebSocket<any>,
	roomId: string,
	auth?: { bat?: string; jwt?: string }
) => Promise<boolean>;

/**
 * Room subscription information
 */
export interface RoomSubscription {
	roomId: string;
	roomType: RoomType;
	subscribedAt: number;
}

/**
 * Room information
 */
export interface Room {
	id: string;
	type: RoomType;
	subscribers: Set<ServerWebSocket<any>>;
	createdAt: number;
}
