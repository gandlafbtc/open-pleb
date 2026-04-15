import { Elysia, t } from "elysia";
import * as sessionRepository from "../../../../../repository/app/session.repository";
import { log } from "../../../../../util/logger";

export const sessionApi = new Elysia({ prefix: "/sessions" })
	/**
	 * GET /sessions/counts
	 * Get counts of active maker and taker sessions
	 */
	.get(
		"/counts",
		async () => {
			try {
				const counts = await sessionRepository.getActiveSessionCounts();
				return {
					success: true,
					data: counts
				};
			} catch (error) {
				log.error("Failed to get session counts: {error}", { error });
				throw new Error("Failed to retrieve session counts");
			}
		},
		{
			detail: {
				summary: "Get active session counts",
				description: "Returns the count of active (non-expired) maker and taker sessions",
				tags: ["Sessions"]
			},
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Object({
						makerCount: t.Number(),
						takerCount: t.Number()
					})
				})
			}
		}
	);
