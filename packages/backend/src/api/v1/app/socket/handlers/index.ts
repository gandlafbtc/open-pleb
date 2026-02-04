import { CommandRegistry } from "./registry";
import { handleSubscribe } from "./subscribe.handler";
import { handleUnsubscribe } from "./unsubscribe.handler";
import { handlePing } from "./ping.handler";
import { WS_COMMAND } from "common/ws-types";

export function createCommandRegistry(): CommandRegistry {
	const registry = new CommandRegistry();
	
	// Register all command handlers
	registry.register(WS_COMMAND.SUBSCRIBE, handleSubscribe);
	registry.register(WS_COMMAND.UNSUBSCRIBE, handleUnsubscribe);
	registry.register(WS_COMMAND.PING, handlePing);
	
	return registry;
}

export { CommandRegistry } from "./registry";
export type { CommandHandler } from "./registry";
