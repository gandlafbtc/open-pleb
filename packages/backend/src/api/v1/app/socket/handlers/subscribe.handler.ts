import type { CommandHandler } from "./registry";
import { WSError } from "../errors/handler";
import { WS_ERROR_CODE, WS_COMMAND } from "common/ws-types";
import type { SubscribeData } from "common/ws-types";
import { log } from "../../../../../util/logger";

export const handleSubscribe: CommandHandler = async (ws, message, roomManager) => {
	const data = message.data as SubscribeData;
	
	if (!data.room) {
		throw new WSError(WS_ERROR_CODE.MISSING_REQUIRED_FIELD, "Missing room field");
	}

	try {
		await roomManager.subscribe(ws, data.room, message.auth);
		
		// Send success response
		ws.send(JSON.stringify({
			type: WS_COMMAND.SUBSCRIBED,
			data: {
				room: data.room,
				timestamp: Date.now()
			}
		}));
		
		log.info(`WebSocket ${ws.data.userId || 'unknown'} subscribed to ${data.room}`);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Forbidden")) {
				throw new WSError(WS_ERROR_CODE.FORBIDDEN, error.message);
			}
			if (error.message.includes("Already subscribed")) {
				throw new WSError(WS_ERROR_CODE.ALREADY_SUBSCRIBED, error.message);
			}
			if (error.message.includes("not found")) {
				throw new WSError(WS_ERROR_CODE.ROOM_NOT_FOUND, error.message);
			}
		}
		throw error;
	}
};
