import { Elysia } from "elysia";
import { log } from "../../../../util/logger";
import { RoomManager } from "./rooms/manager";
import { createCommandRegistry } from "./handlers";
import { WSErrorHandler, WSError } from "./errors/handler";
import { WS_ERROR_CODE, type WSClientMessage } from "common/ws-types";
import type { ElysiaWS } from "elysia/ws";

// Global instances
const roomManager = new RoomManager();
const commandRegistry = createCommandRegistry();
const wsRegistry = new Map<string, ElysiaWS>();

export const v1WS = new Elysia()
  .ws("/ws/v1", {
    open(ws) {
      try {
        // Register WebSocket connection
        wsRegistry.set(ws.id, ws);
        log.info`WebSocket connected: ${ws.id}`;
      } catch (error) {
        log.error`Error in WebSocket open handler: ${error}`;
      }
    },
    
    async message(ws, message) {
      try {
        // Parse and validate message
        let parsedMessage: WSClientMessage;
        
        if (typeof message === 'string') {
          try {
            parsedMessage = JSON.parse(message);
          } catch (error) {
            throw new WSError(
              WS_ERROR_CODE.INVALID_MESSAGE,
              "Invalid JSON message"
            );
          }
        } else {
          parsedMessage = message as WSClientMessage;
        }

        // Validate message structure
        if (!parsedMessage.type || !parsedMessage.data) {
          throw new WSError(
            WS_ERROR_CODE.INVALID_MESSAGE,
            "Message must have 'type' and 'data' fields"
          );
        }

        log.debug`Message from ${ws.id}: ${parsedMessage.type}`;

        // Handle the command
        await commandRegistry.handle(ws, parsedMessage, roomManager);
        
      } catch (error) {
        // Send error response to client
        const requestType = 
          message && 
          typeof message === 'object' && 
          'type' in message && 
          typeof message.type === 'string' 
            ? message.type 
            : undefined;
            
        WSErrorHandler.send(
          ws as any, // Type compatibility with existing error handler
          error instanceof Error ? error : new Error(String(error)),
          requestType
        );
      }
    },
    
    close(ws, code, reason) {
      try {
        // Clean up subscriptions
        roomManager.cleanup(ws);
        
        // Remove from registry
        wsRegistry.delete(ws.id);
        
        log.info`WebSocket disconnected: ${ws.id} (code: ${code}, reason: ${reason})`;
      } catch (error) {
        log.error`Error in WebSocket close handler: ${error}`;
      }
    }
  });

// Export for broadcasting
export function broadcastToRoom(roomId: string, message: any): void {
  roomManager.broadcast(roomId, message, wsRegistry);
}
