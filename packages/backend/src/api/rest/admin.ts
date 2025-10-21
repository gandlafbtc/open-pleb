import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { auth } from "../auth/routes";

export const adminAPI = new Elysia().group("/admin", (app) =>
	app
		.use(
			jwt({
				name: "jwt",
				secret: Bun.env.OPENPLEB_JWT_SECRET!,
				exp: "7d",
			}),
		)
		.use(auth),
);
