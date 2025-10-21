import { ensureError } from "@openPleb/common/errors";
import { takerMakerData } from "../dynamic/takersMakers";
import { log } from "../logger";
import cron from "@elysiajs/cron";

export const updateConnectedCorn = 		cron({
			name: "update-connections",
			// run every 10 seconds
			pattern: "*/10 * * * * *",
			run() {
				try {
					
					updateConnected();
				} catch (error) {
					const err = ensureError(error);
					log.error("Error: {error}", { error });
				}
			},
		})

export const updateConnected = () => {
	const now = Date.now();
	takerMakerData.makers = takerMakerData.makers.filter(
		(maker) => maker.ts < now - 15 * 1000,
	);
	takerMakerData.takers = takerMakerData.takers.filter(
		(maker) => maker.ts < now - 15 * 1000,
	);
};
