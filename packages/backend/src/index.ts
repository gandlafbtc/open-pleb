import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);
const adminApp = new Elysia().get("/admin", () => "Hello Elysia").listen(3001);