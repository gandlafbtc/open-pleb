import Elysia from "elysia";
import { open } from "./open";
import { adminAPI } from "./admin";
import { subsAPI } from "./subs";

export const v1 = new Elysia().group("/api/v1", (app) =>
	app.use(open).use(subsAPI).use(adminAPI),
);
