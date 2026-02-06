import { ROOM_TYPE, RoomIds, type RoomType } from "common/ws-types";
import { log } from "../../../../../util/logger";
import type { ServerWebSocket } from "bun";
import type { WSData } from "../types";
import { AuthCheckFn, AuthChecks } from "./auth-checks";

export interface AuthData {
	bat?: string;
	jwt?: string;
}

interface Room {
	id: string;
	type: RoomType;
	subscribers: Set<ServerWebSocket<WSData>>;
	authCheck: AuthCheckFn;
}

export class RoomManager {
	private rooms = new Map<string, Room>();
	private wsToRooms = new WeakMap<ServerWebSocket<WSData>, Set<string>>();

	constructor() {
		// Initialize global room (always available)
		this.createRoom(RoomIds.global(), ROOM_TYPE.GLOBAL, async () => true);
		// Initialize admin room
		this.createRoom(RoomIds.admin(), ROOM_TYPE.ADMIN, async () => false); // Will be replaced with actual auth
	}

	createRoom(id: string, type: RoomType, authCheck: AuthCheckFn): void {
		if (this.rooms.has(id)) {
			log.warn(`Room ${id} already exists`);
			return;
		}

		this.rooms.set(id, {
			id,
			type,
			subscribers: new Set(),
			authCheck,
		});

		log.info(`Room created: ${id} (${type})`);
	}

	async subscribe(ws: ServerWebSocket<WSData>, roomId: string, auth?: AuthData): Promise<void> {
		// Get or create room
		let room = this.rooms.get(roomId);
		
		// For offer rooms, create dynamically if they don't exist
		if (!room && roomId.startsWith('offer:')) {
			const roomType = RoomIds.parseType(roomId);
			this.createRoom(roomId, roomType, AuthChecks.offer);
			room = this.rooms.get(roomId);
		}

		if (!room) {
			throw new Error(`Room not found: ${roomId}`);
		}

		// Check if already subscribed
		if (room.subscribers.has(ws)) {
			throw new Error(`Already subscribed to room: ${roomId}`);
		}

		// Check authorization
		const authorized = await room.authCheck(ws, roomId, auth);
		if (!authorized) {
			throw new Error(`Forbidden: Not authorized for room: ${roomId}`);
		}

		// Add subscriber
		room.subscribers.add(ws);

		// Track subscription
		if (!this.wsToRooms.has(ws)) {
			this.wsToRooms.set(ws, new Set());
		}
		this.wsToRooms.get(ws)!.add(roomId);

		log.info(`WebSocket ${ws.data.userId || 'unknown'} subscribed to room: ${roomId}`);
	}

	unsubscribe(ws: ServerWebSocket<WSData>, roomId: string): void {
		const room = this.rooms.get(roomId);
		if (!room) {
			throw new Error(`Room not found: ${roomId}`);
		}

		if (!room.subscribers.has(ws)) {
			throw new Error(`Not subscribed to room: ${roomId}`);
		}

		room.subscribers.delete(ws);
		this.wsToRooms.get(ws)?.delete(roomId);

		log.info(`WebSocket ${ws.data.userId || 'unknown'} unsubscribed from room: ${roomId}`);

		// Clean up empty offer rooms (but keep global and admin)
		if (room.subscribers.size === 0 && room.type === ROOM_TYPE.OFFER) {
			this.rooms.delete(roomId);
			log.info(`Empty offer room deleted: ${roomId}`);
		}
	}

	broadcast(
		roomId: string,
		message: unknown
	): void {
		const room = this.rooms.get(roomId);
		if (!room) {
			log.warn(`Cannot broadcast to non-existent room: ${roomId}`);
			return;
		}

		const payload = JSON.stringify(message);
		let sentCount = 0;

		room.subscribers.forEach((ws) => {
			if (ws.readyState === 1) { // WebSocket.OPEN
				try {
					ws.send(payload);
					sentCount++;
				} catch (error) {
					log.error(`Failed to send to ${ws.data.userId || 'unknown'}: ${error}`);
				}
			}
		});

		log.debug(`Broadcast to room ${roomId}: ${sentCount}/${room.subscribers.size} clients`);
	}

	cleanup(ws: ServerWebSocket<WSData>): void {
		const rooms = this.wsToRooms.get(ws);
		if (!rooms) return;

		rooms.forEach((roomId) => {
			const room = this.rooms.get(roomId);
			if (room) {
				room.subscribers.delete(ws);
				
				// Clean up empty offer rooms
				if (room.subscribers.size === 0 && room.type === ROOM_TYPE.OFFER) {
					this.rooms.delete(roomId);
					log.info(`Empty offer room deleted: ${roomId}`);
				}
			}
		});

		this.wsToRooms.delete(ws);
		log.info(`Cleaned up subscriptions for WebSocket: ${ws.data.userId || 'unknown'}`);
	}

	getSubscriptions(ws: ServerWebSocket<WSData>): string[] {
		return Array.from(this.wsToRooms.get(ws) || []);
	}
}
