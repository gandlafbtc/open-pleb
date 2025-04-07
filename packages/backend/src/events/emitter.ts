import { EventEmitter } from "node:events";

class CustomEmitter extends EventEmitter {}

export const eventEmitter = new CustomEmitter();
