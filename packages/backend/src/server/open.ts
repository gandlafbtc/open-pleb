import { getConversionRate } from "@openPleb/common/conversion";
import { ensureError } from "@openPleb/common/errors";
import type { PingData } from "@openPleb/common/types";
import type Elysia from "elysia";
import type { ElysiaWS } from "elysia/ws";
import { eventEmitter } from "../events/emitter";
import { log } from "../logger";
import type { SocketEventData } from "../types";
import { getData, getDataForId } from "./api/data";
import { offers } from "./api/offers/offers";

export const open = (app: Elysia) =>
	app
		.get("/conversion", async () => {
			try {
				const conversion = await getConversionRate();
				return { conversion };
			} catch (error) {
				const err = ensureError(error);
				log.error("Error getting conversion rate {error}", { error });
				return new Response(err.message, {
					status: 500,
				});
			}
		})
		.get("/data/:pubkey", async ({ params }) => {
			try {
				return await getData(params.pubkey);
			} catch (error) {
				const err = ensureError(error);
				log.error("Error getting data for pubkey {pubkey}: {error}", {
					error,
					pubkey: params.pubkey,
				});
				return new Response(err.message, {
					status: 500,
				});
			}
		})
		.get("/data/for/:id", async ({ params }) => {
			try {
				const id = Number.parseInt(params.id);
				return await getDataForId(id);
			} catch (error) {
				const err = ensureError(error);
				log.error("Error getting data for id {id}: {error}", {
					error,
					id: params.id,
				});
				return new Response(err.message, {
					status: 500,
				});
			}
		})

		.use(offers)
		.ws("/ws", {
			open: (ws) => {
				ws.subscribe("message");
				sendPing(ws);
				setInterval(async () => {
					sendPing(ws);
				}, 10000);
				eventEmitter.on("socket-event", (e: SocketEventData) => {
					log.debug("Sending socket event {e}", { e });
					ws.send(e);
				});
			},
			message(ws, message: string) {
				//receiving messages
				try {
					//@ts-ignore
					handleCommand(message);
				} catch (error) {
					console.error(error);
				}
			},
		});

const sendPing = async (ws: ElysiaWS) => {
	try {
		const pingData: PingData = {
			ping: "ping",
		};
		ws.send({ command: "ping", data: pingData });
		// log.debug(`sent websocket ping {pingData}`, {pingData} )
	} catch (error) {
		const err = ensureError(error);
		log.warn("websocket Ping error {error}", { error });
		ws.send({
			command: "ping",
			data: {
				isConnected: false,
				detail: err.message,
			},
		});
	}
};
const handleCommand = async (message: { command: string; data: unknown }) => {
	switch (message.command) {
		case "command": {
			break;
		}
		case "pong":
			break;
		default:
			log.warn("Unknown websocket command {message}", { message });
			break;
	}
};
