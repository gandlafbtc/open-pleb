import Elysia from "elysia";
import { admin } from "./admin";
import jwt from "@elysiajs/jwt";
import { isAuthenticated } from "../auth/middleware";
import { auth } from "../auth/routes";

export const v1Admin = new Elysia().group("/api/v1/admin", (app) =>
	app
		.use(
			jwt({
				name: "jwt",
				secret: Bun.env.OPENPLEB_JWT_SECRET!,
				exp: "7d",
			}),
		)
		.group("/auth", (authApp) => authApp.use(auth))
		.use(isAuthenticated)
		.use(admin)
);
