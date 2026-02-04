# WebSocket Client

Type-safe WebSocket client with automatic reconnection and message handler registry.

## Usage

### Basic Setup

```typescript
import { socket } from "$lib/interface/ws";

// The socket is automatically connected when imported
```

### Subscribing to Rooms

```typescript
// Subscribe to a room
socket.subscribe("offers");

// Subscribe with authentication
socket.subscribe("user:123", {
  jwt: "your-jwt-token",
  bat: "your-bat-token"
});

// Unsubscribe from a room
socket.unsubscribe("offers");
```

### Handling Messages

The client provides typed handlers for different message types:

#### Pong Handler

```typescript
const unsubscribe = socket.onPong((data) => {
  console.log("Pong received:", data.timestamp);
});

// Clean up when done
unsubscribe();
```

#### Subscribed Handler

```typescript
socket.onSubscribed((data) => {
  console.log("Subscribed to room:", data.room);
});
```

#### Unsubscribed Handler

```typescript
socket.onUnsubscribed((data) => {
  console.log("Unsubscribed from room:", data.room);
});
```

#### Error Handler

```typescript
socket.onError((data) => {
  console.error("WebSocket error:", data.code, data.message);
});
```

#### Update Handler

Handles all offer-related updates (created, updated, claimed, completed, disputed, resolved):

```typescript
socket.onUpdate((data) => {
  console.log("Offer update:", data.offerId, data.state);
  // Handle the update in your application
});
```

### Connection Events

```typescript
// Handle connection open
socket.onOpen(() => {
  console.log("WebSocket connected");
});

// Handle connection close
socket.onClose(() => {
  console.log("WebSocket disconnected");
});
```

### Sending Custom Messages

```typescript
import { WS_COMMAND } from "common/ws-types";

socket.send({
  type: WS_COMMAND.PING,
  data: { timestamp: Date.now() }
});
```

### Manual Ping

```typescript
// Send a ping with current timestamp
socket.ping();

// Send a ping with custom timestamp
socket.ping(Date.now());
```

### Connection State

```typescript
// Check if connected
if (socket.isConnected) {
  console.log("Socket is connected");
}

// Get WebSocket ready state
console.log("Ready state:", socket.readyState);
```

### Cleanup

```typescript
// Close the connection (disables auto-reconnect)
socket.close();
```

## Example: Real-time Offer Updates

```typescript
import { socket } from "$lib/interface/ws";
import { onMount, onDestroy } from "svelte";

onMount(() => {
  // Subscribe to offers room
  socket.subscribe("offers");

  // Handle offer updates
  const unsubscribeUpdate = socket.onUpdate((data) => {
    console.log(`Offer ${data.offerId} is now ${data.state}`);
    // Update your UI here
  });

  // Handle errors
  const unsubscribeError = socket.onError((data) => {
    console.error("Error:", data.message);
  });

  // Cleanup on component destroy
  onDestroy(() => {
    socket.unsubscribe("offers");
    unsubscribeUpdate();
    unsubscribeError();
  });
});
```

## Architecture

### Message Handler Registry

The client uses a `MessageHandlerRegistry` internally to manage typed message handlers. This provides:

- **Type Safety**: Each handler receives properly typed data
- **Multiple Handlers**: Multiple handlers can be registered for the same message type
- **Error Isolation**: Errors in one handler don't affect others
- **Easy Cleanup**: Each registration returns an unsubscribe function

### Automatic Reconnection

The client automatically reconnects with exponential backoff:

- Initial delay: 1 second
- Max delay: 30 seconds
- Max attempts: 10
- Backoff multiplier: 1.5x

### Heartbeat

The client sends automatic ping messages every 30 seconds to keep the connection alive.
