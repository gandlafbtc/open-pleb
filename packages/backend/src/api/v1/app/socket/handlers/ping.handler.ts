import type { CommandHandler } from "./registry";
import { WS_COMMAND } from "common/ws-types";
import type { PingData } from "common/ws-types";
import { log } from "../../../../../util/logger";

export const handlePing: CommandHandler = async (ws, message, roomManager) => {
	const data = message.data as PingData;
	
	// Send pong response
	ws.send(JSON.stringify({
		type: WS_COMMAND.PONG,
		data: {
			timestamp: Date.now(),
			clientTimestamp: data?.timestamp
		}
	}));
	
	log.debug`Ping from ${ws.id}`;
};
