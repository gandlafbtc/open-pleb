import { ROOM_TYPE, RoomIds, type RoomType } from "common/ws-types";
import { log } from "../../../../../util/logger";
import { ElysiaWS } from "elysia/ws";
import { AuthCheckFn, AuthChecks } from "./auth-checks";

export interface AuthData {
	bat?: string;
	jwt?: string;
}



interface Room {
	id: string;
	type: RoomType;
	subscribers: Set<string>;
	authCheck: AuthCheckFn;
}

export class RoomManager {
	private rooms = new Map<string, Room>();
	private wsToRooms = new Map<string, Set<string>>();

	constructor() {
		// Initialize global room (always available)
		this.createRoom(RoomIds.global(), ROOM_TYPE.GLOBAL, async () => true);
		// Initialize admin room
		this.createRoom(RoomIds.admin(), ROOM_TYPE.ADMIN, async () => false); // Will be replaced with actual auth
	}

	createRoom(id: string, type: RoomType, authCheck: AuthCheckFn): void {
		if (this.rooms.has(id)) {
			log.warn`Room ${id} already exists`;
			return;
		}

		this.rooms.set(id, {
			id,
			type,
			subscribers: new Set(),
			authCheck,
		});

		log.info`Room created: ${id} (${type})`;
	}

	async subscribe(ws: ElysiaWS, roomId: string, auth?: AuthData): Promise<void> {
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
		if (room.subscribers.has(ws.id)) {
			throw new Error(`Already subscribed to room: ${roomId}`);
		}

		// Check authorization
		const authorized = await room.authCheck(ws, roomId, auth);
		if (!authorized) {
			throw new Error(`Forbidden: Not authorized for room: ${roomId}`);
		}

		// Add subscriber
		room.subscribers.add(ws.id);

		// Track subscription
		if (!this.wsToRooms.has(ws.id)) {
			this.wsToRooms.set(ws.id, new Set());
		}
		this.wsToRooms.get(ws.id)!.add(roomId);

		log.info`WebSocket ${ws.id} subscribed to room: ${roomId}`;
	}

	unsubscribe(ws: ElysiaWS, roomId: string): void {
		const room = this.rooms.get(roomId);
		if (!room) {
			throw new Error(`Room not found: ${roomId}`);
		}

		if (!room.subscribers.has(ws.id)) {
			throw new Error(`Not subscribed to room: ${roomId}`);
		}

		room.subscribers.delete(ws.id);
		this.wsToRooms.get(ws.id)?.delete(roomId);

		log.info`WebSocket ${ws.id} unsubscribed from room: ${roomId}`;

		// Clean up empty offer rooms (but keep global and admin)
		if (room.subscribers.size === 0 && room.type === ROOM_TYPE.OFFER) {
			this.rooms.delete(roomId);
			log.info`Empty offer room deleted: ${roomId}`;
		}
	}

	broadcast(
		roomId: string,
		message: any,
		wsRegistry: Map<string, ElysiaWS>
	): void {
		const room = this.rooms.get(roomId);
		if (!room) {
			log.warn`Cannot broadcast to non-existent room: ${roomId}`;
			return;
		}

		const payload = JSON.stringify(message);
		let sentCount = 0;

		room.subscribers.forEach((wsId) => {
			const ws = wsRegistry.get(wsId);
			if (ws?.readyState === 1) { // WebSocket.OPEN
				try {
					ws.send(payload);
					sentCount++;
				} catch (error) {
					log.error`Failed to send to ${wsId}: ${error}`;
				}
			}
		});

		log.debug`Broadcast to room ${roomId}: ${sentCount}/${room.subscribers.size} clients`;
	}

	cleanup(ws: ElysiaWS): void {
		const rooms = this.wsToRooms.get(ws.id);
		if (!rooms) return;

		rooms.forEach((roomId) => {
			const room = this.rooms.get(roomId);
			if (room) {
				room.subscribers.delete(ws.id);
				
				// Clean up empty offer rooms
				if (room.subscribers.size === 0 && room.type === ROOM_TYPE.OFFER) {
					this.rooms.delete(roomId);
					log.info`Empty offer room deleted: ${roomId}`;
				}
			}
		});

		this.wsToRooms.delete(ws.id);
		log.info`Cleaned up subscriptions for WebSocket: ${ws.id}`;
	}

	getSubscriptions(ws: ElysiaWS): string[] {
		return Array.from(this.wsToRooms.get(ws.id) || []);
	}
}
