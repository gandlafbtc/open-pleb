import Elysia from "elysia";
import { open } from "./open";


export const v1Open = new Elysia().group("/api/v1", (app) =>
	app.use(open)
);
