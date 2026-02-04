import type { WSClientMessage } from "common/ws-types";
import type { RoomManager } from "../rooms/manager";
import { WSError, WSErrorHandler } from "../errors/handler";
import { WS_ERROR_CODE } from "common/ws-types";
import { log } from "../../../../../util/logger";
import { ElysiaWS } from "elysia/ws";

export type CommandHandler = (
	ws: ElysiaWS,
	message: WSClientMessage,
	roomManager: RoomManager
) => Promise<void>;

export class CommandRegistry {
	private handlers = new Map<string, CommandHandler>();

	register(command: string, handler: CommandHandler): void {
		if (this.handlers.has(command)) {
			log.warn`Command handler already registered: ${command}`;
			return;
		}
		this.handlers.set(command, handler);
		log.info`Registered command handler: ${command}`;
	}

	async handle(
		ws: ElysiaWS,
		message: WSClientMessage,
		roomManager: RoomManager
	): Promise<void> {
		const handler = this.handlers.get(message.type);
		
		if (!handler) {
			throw new WSError(
				WS_ERROR_CODE.HANDLER_NOT_FOUND,
				`Unknown command: ${message.type}`
			);
		}

		try {
			await handler(ws, message, roomManager);
		} catch (error) {
			// Re-throw WSError as-is, wrap other errors
			if (error instanceof WSError) {
				throw error;
			}
			throw new WSError(
				WS_ERROR_CODE.INTERNAL_ERROR,
				error instanceof Error ? error.message : String(error)
			);
		}
	}

	getRegisteredCommands(): string[] {
		return Array.from(this.handlers.keys());
	}
}
