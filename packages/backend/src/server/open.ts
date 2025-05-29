import { getConversionRate } from "@openPleb/common/conversion";
import { ensureError } from "@openPleb/common/errors";
import type { PingData } from "@openPleb/common/types";
import type Elysia from "elysia";
import type { ElysiaWS } from "elysia/ws";
import { takerMakerData } from "../dynamic/takersMakers";
import { eventEmitter } from "../events/emitter";
import { log } from "../logger";
import type { SocketEventData } from "../types";
import { getData, getDataForId } from "./api/data";
import { offers } from "./api/offers/offers";
import { environment } from "../env";


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
})		.get("/envsettings", async () => {
		try {
			return { 
				env: environment
			 };
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
				const data = await getData(params.pubkey)
				return {...data, env: environment};
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
				const headers = ws.data.request.headers;
				const pubkey = JSON.parse(JSON.stringify(headers))[
					"sec-websocket-protocol"
				];
				ws.subscribe("message");
				sendPing(ws);
				setInterval(async () => {
					sendPing(ws);
				}, 5000);
				eventEmitter.on("socket-event", (e: SocketEventData) => {
					//if it's a pubkey event and it's not for this pubkey, ignore it
					if (e.pubkeys?.length && !e.pubkeys.includes(pubkey)) {
						return;
					}
					log.debug("Sending socket event {e}", { e: e.command });
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
			takers: takerMakerData.takers.length,
			makers: takerMakerData.makers.length,
			price: await getConversionRate(),
		};
		ws.send({ command: "ping", data: pingData });
	} catch (error) {
		const err = ensureError(error);
		log.warn("websocket Ping error {error}", { error: err.message });
	}
};

const handlePong = (data: { pubkey: string; mode: string }) => {
	const newEntry = {
		pubkey: data.pubkey,
		ts: Date.now(),
	};
	if (data.mode === "pay") {
		const i = takerMakerData.makers.findIndex(
			(maker) => maker.pubkey === data.pubkey,
		);
		if (i !== -1) {
			takerMakerData.makers.splice(i, 1, newEntry);
		} else {
			takerMakerData.makers.push(newEntry);
		}
	} else if (data.mode === "earn") {
		const i = takerMakerData.takers.findIndex(
			(taker) => taker.pubkey === data.pubkey,
		);
		if (i !== -1) {
			takerMakerData.takers.splice(i, 1, newEntry);
		} else {
			takerMakerData.takers.push(newEntry);
		}
	}
};

const handleCommand = async (message: { command: string; data: unknown }) => {
	switch (message.command) {
		case "command": {
			break;
		}
		case "pong":
			handlePong(message.data as { pubkey: string; mode: string });
			break;
		default:
			log.warn("Unknown websocket command {message}", { message });
			break;
	}
};
