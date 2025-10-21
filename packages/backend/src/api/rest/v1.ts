import Elysia from "elysia";
import { adminAPI } from "./admin";
import { open } from "./open";
import { subsAPI } from "./subs";

export const v1 = new Elysia().group("/api/v1", (app) =>
	app.use(open).use(subsAPI).use(adminAPI),
);
